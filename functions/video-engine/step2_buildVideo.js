/**
 * step2_buildVideo.ts
 *
 * Step 2 — FFmpeg video composition pipeline.
 *
 * Responsibilities:
 *   - Validate Step 1 completion (complete.json must exist)
 *   - Fetch and validate manifest, metadata, camera_state from Firebase Storage
 *   - Sync missing frames locally
 *   - Build cinematic filtergraph per aspect ratio using layout presets
 *   - Support grading presets, text overlays, CTA, watermark, optional audio
 *   - Upload final MP4 variants to Firebase Storage (ffmpeg1/{slug}/)
 *
 * Does NOT call Mapbox. Zero Mapbox usage here.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync, spawn } from "node:child_process";
import { getFrameStoragePaths, validateManifestShape, validateManifestStrict, validateCompleteMarker, } from "./utils/storageManifest.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { resolveVariantConfig, } from "./utils/variantSchema.js";
import { narrativePlanToVariantConfig, } from "./narrative/buildNarrativePlan.js";
// ── GPU detection ─────────────────────────────────────────────────────────
/**
 * Check if NVENC hardware encoder is actually usable at runtime.
 * A simple check of `-encoders` output is insufficient because h264_nvenc
 * can appear in the list even when libcuda.so.1 is unavailable (dev containers,
 * CPU-only cloud VMs). Instead, run a 1-frame test encode.
 */
function checkNvencAvailable() {
    try {
        const result = spawnSync("ffmpeg", ["-y", "-f", "lavfi", "-i", "color=black:s=64x64:d=0.1",
            "-vframes", "1", "-c:v", "h264_nvenc", "-f", "null", "-"], { encoding: "utf-8", timeout: 8000 });
        return result.status === 0;
    }
    catch {
        return false;
    }
}
function resolveEncoder() {
    const gpu = checkNvencAvailable();
    if (gpu) {
        return { encoder: "h264_nvenc", preset: "p4", gpu: true }; // p4 = quality preset for NVENC
    }
    return { encoder: "libx264", preset: "slower", gpu: false };
}
function log(event) {
    event.step = "step2";
    console.log(JSON.stringify(event));
}
async function checkFileExists(bucket, path) {
    const [exists] = await bucket.file(path).exists();
    return exists;
}
async function downloadJson(bucket, path) {
    const [data] = await bucket.file(path).download();
    return JSON.parse(data.toString());
}
async function concurrentMap(items, concurrency, fn) {
    const results = new Array(items.length);
    let cursor = 0;
    const worker = async () => {
        while (cursor < items.length) {
            const i = cursor++;
            results[i] = await fn(items[i], i);
        }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
    return results;
}
const DOWNLOAD_CONCURRENCY = 10;
export async function buildVideo(input, options) {
    const { slug } = input;
    const { bucket, keepLocalFrames = false, presetOverride } = options;
    const narrativeVariant = options.narrativePlan
        ? narrativePlanToVariantConfig(options.narrativePlan)
        : {};
    const variant = resolveVariantConfig({ ...narrativeVariant, ...(options.variant ?? {}) });
    const suffix = options.outputSuffix ?? "";
    const pipelineStart = Date.now();
    // Detect GPU encoder once at startup
    const { encoder, preset, gpu } = resolveEncoder();
    log({
        slug,
        event: "start",
        encoder,
        gpu,
        variant: variant.gradePreset,
        aspects: variant.outputAspects,
        narrativeId: options.narrativePlan?.narrativeId,
    });
    log({ slug, event: "mapbox_calls", count: 0 });
    console.log(`\n[Step2] Encoder: ${encoder} (${gpu ? "GPU" : "CPU"}), aspects: ${variant.outputAspects.join(", ")}`);
    const localTempBaseDir = options.localTempBaseDir ?? path.resolve(__dirname, "temp_frames");
    const localSlugDir = path.join(localTempBaseDir, slug);
    const localFramesDir = path.join(localSlugDir, "frames");
    const localOutputDir = path.resolve(__dirname, "output", slug);
    await fsp.mkdir(localOutputDir, { recursive: true });
    let storagePaths = getFrameStoragePaths(slug);
    // ── Hardcoded override for RA033 (Asset Vault Routing) ─────────────────
    if (slug === "RA033") {
        console.log(`[Step2] Applying RA033 Asset Vault override...`);
        const assetId = "mission_track_RA033_hero_amber_v1";
        const vaultBase = `asset_vault/real/${assetId}`;
        storagePaths = {
            framesDir: `${vaultBase}/frames/`,
            metadataFile: `${vaultBase}/metadata.json`,
            cameraStateFile: `${vaultBase}/camera_state.json`,
            manifestFile: `${vaultBase}/manifest.json`,
            completeFile: `${vaultBase}/complete.json`,
            archiveFile: `${vaultBase}/frames.tar.gz`, // User specified this path
            frameFile: (index) => `${vaultBase}/frames/frame_${String(index).padStart(4, "0")}.png`,
        };
    }
    // ── Validate Step 1 completion ─────────────────────────────────────────
    console.log(`[Step2] Validating Step 1 completion for: ${slug}`);
    const completeExists = await checkFileExists(bucket, storagePaths.completeFile);
    if (!completeExists) {
        throw new Error(`[Step2] ABORT: complete.json not found at gs://${bucket.name}/${storagePaths.completeFile}. ` +
            `Run Step 1 first.`);
    }
    const completeMarker = await downloadJson(bucket, storagePaths.completeFile);
    const expectedFrames = completeMarker.frameCount;
    const completeValidation = validateCompleteMarker(completeMarker, expectedFrames);
    if (!completeValidation.valid) {
        throw new Error(`[Step2] ABORT: complete.json invalid — ${completeValidation.reason}`);
    }
    console.log(`[Step2] ✓ complete.json valid (${completeMarker.frameCount} frames)`);
    // ── Fetch metadata + manifest ──────────────────────────────────────────
    const metadata = await downloadJson(bucket, storagePaths.metadataFile);
    // Fallback for missing durationSeconds (e.g. from Harvester v1)
    if (slug === "RA033" && !metadata.durationSeconds) {
        metadata.durationSeconds = 5; // 150 frames @ 30fps
    }
    const manifest = await downloadJson(bucket, storagePaths.manifestFile);
    const manifestValidation = validateManifestShape(manifest, expectedFrames);
    if (!manifestValidation.valid) {
        throw new Error(`[Step2] ABORT: manifest shape invalid — ${manifestValidation.reason}`);
    }
    console.log(`[Step2] ✓ manifest shape valid (${manifest.totalFrames} frames)`);
    console.log(`[Step2] No Mapbox calls — consuming stored frames from gs://${bucket.name}/${storagePaths.framesDir}`);
    // ── Sync missing frames locally ────────────────────────────────────────
    await fsp.mkdir(localFramesDir, { recursive: true });
    const missingFrames = manifest.files.filter((filename) => !fs.existsSync(path.join(localFramesDir, filename)));
    const cacheHit = missingFrames.length === 0;
    if (cacheHit) {
        console.log(`[Step2] Cache hit — all ${manifest.totalFrames} frames already local`);
        log({ slug, event: "frame_sync_skipped", cacheHit: true, frameCount: manifest.totalFrames });
    }
    else {
        // Special Case: RA033 Archive Extraction
        if (slug === "RA033" && storagePaths.archiveFile) {
            console.log(`[Step2] RA033 detected, attempting archive extraction from: ${storagePaths.archiveFile}`);
            const localArchivePath = path.join(localSlugDir, "frames.tar.gz");
            const archiveExists = await checkFileExists(bucket, storagePaths.archiveFile);
            if (archiveExists) {
                console.log(`[Step2] Downloading archive...`);
                await bucket.file(storagePaths.archiveFile).download({ destination: localArchivePath });
                console.log(`[Step2] Extracting archive...`);
                // Use execSync for tar extraction
                const { execSync } = await import("node:child_process");
                try {
                    // Harvester v1 archives the 'frames' directory, so we extract from localSlugDir
                    execSync(`tar -xzf "${localArchivePath}" -C "${localSlugDir}"`, { stdio: "inherit" });
                    console.log(`[Step2] Extraction complete.`);
                    // Refresh missingFrames count
                    const stillMissing = manifest.files.filter((filename) => !fs.existsSync(path.join(localFramesDir, filename)));
                    if (stillMissing.length === 0) {
                        console.log(`[Step2] Archive sync successful, all frames present.`);
                        log({ slug, event: "frame_sync_complete", archive: true, frameCount: manifest.totalFrames });
                        // No return here, just continue
                    }
                } catch (err) {
                    console.error(`[Step2] Archive extraction failed:`, err.message);
                }
            } else {
                console.warn(`[Step2] Archive not found at ${storagePaths.archiveFile}, falling back to individual downloads.`);
            }
        }

        // Re-calculate missing frames after potential extraction
        const missingAfterArchive = manifest.files.filter((filename) => !fs.existsSync(path.join(localFramesDir, filename)));
        
        if (missingAfterArchive.length > 0) {
            console.log(`[Step2] Downloading ${missingAfterArchive.length} missing frames from Firebase Storage...`);
            const syncStart = Date.now();
            await concurrentMap(missingAfterArchive, DOWNLOAD_CONCURRENCY, async (filename) => {
                const storageSrc = `${storagePaths.framesDir}${filename}`;
                const localDest = path.join(localFramesDir, filename);
                await bucket.file(storageSrc).download({ destination: localDest });
            });
            const syncMs = Date.now() - syncStart;
            log({ slug, event: "frame_sync_complete", durationMs: syncMs, frameCount: missingAfterArchive.length, cacheHit: false });
            console.log(`[Step2] Frame sync complete in ${Math.round(syncMs / 1000)}s`);
        }
    }

    // ── Strict local frame validation ──────────────────────────────────────
    // Validates: exact filename match, no missing indices, no zero-byte files
    const strictValidation = validateManifestStrict(manifest, localFramesDir);
    if (!strictValidation.valid) {
        throw new Error(`[Step2] ABORT: strict frame validation failed — ${strictValidation.reason}`);
    }
    const aspects = ["16:9"]; // Prototype phase: lock to 16:9 only
    const inputFps = Math.max(1, Number((manifest.totalFrames / Math.max(1, metadata.durationSeconds)).toFixed(4)));
    // STEP 2 — Verify frame input pattern
    const frameExt = manifest.files[0]?.split(".").pop() ?? "png";
    const framePattern = path.join(localFramesDir, `frame_%04d.${frameExt}`);
    // Log and validate frame pattern
    console.log(`[Step2][DEBUG] Frame pattern: ${framePattern}`);
    const frameFiles = await fsp.readdir(localFramesDir);
    const expectedFiles = Array.from({ length: manifest.totalFrames }, (_, i) => `frame_${i.toString().padStart(4, "0")}.${frameExt}`);
    const missing = expectedFiles.filter(f => !frameFiles.includes(f));
    if (missing.length > 0) {
        throw new Error(`[Step2][ERROR] Missing frame files: ${missing.join(", ")}`);
    }
    console.log(`[Step2][DEBUG] Frame files validated: ${expectedFiles.length} files, sequential, no missing indices.`);
    const audioInput = variant.musicBedPath
        ? `-i "${variant.musicBedPath}"`
        : `-f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100`;
    // ── Map each aspect to its output file ────────────────────────────────
    // suffix is appended before .mp4 so e.g. "_brightA" → "slug_brightA.mp4"
    const aspectOutputMap = {
        "16:9": path.join(localOutputDir, `${slug}${suffix}.mp4`),
        "9:16": path.join(localOutputDir, `${slug}${suffix}_9x16.mp4`),
        "1:1": path.join(localOutputDir, `${slug}${suffix}_1x1.mp4`),
    };
    const aspectStorageSuffixMap = {
        "16:9": `ffmpeg1/${slug}/${slug}${suffix}.mp4`,
        "9:16": `ffmpeg1/${slug}/${slug}${suffix}_9x16.mp4`,
        "1:1": `ffmpeg1/${slug}/${slug}${suffix}_1x1.mp4`,
    };
    // Build NVENC or x264 encode flags
    const speedPreset = presetOverride ?? preset;
    const videoEncodeFlags = gpu
        ? `-c:v h264_nvenc -preset ${speedPreset} -rc vbr -cq 18 -pix_fmt yuv420p`
        : `-c:v libx264 -preset ${speedPreset} -tune film -crf 18 -pix_fmt yuv420p`;
    const masterVideoPath = path.join(localOutputDir, `${slug}_master.mp4`);
    const runFfmpeg = async (args, label, timeoutMs = 600000) => {
        console.log(`
[Step2][${label}] FFmpeg args: ffmpeg ${args.join(" ")}`);
        console.log(`[Step2][${label}] Running FFmpeg...`);
        const start = Date.now();
        await new Promise((resolve, reject) => {
            const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
            let lastOutput = Date.now();
            const onData = (chunk) => {
                process.stdout.write(chunk);
                lastOutput = Date.now();
            };
            proc.stdout.on("data", onData);
            proc.stderr.on("data", onData);
            const timeout = setInterval(() => {
                if (Date.now() - lastOutput > timeoutMs) {
                    console.error(`[Step2][${label}][ERROR] FFmpeg stalled (no output for ${timeoutMs / 1000}s), killing process.`);
                    proc.kill("SIGKILL");
                    clearInterval(timeout);
                    reject(new Error(`FFmpeg stalled in ${label}`));
                }
            }, 1000);
            proc.on("exit", (code) => {
                clearInterval(timeout);
                if (code === 0) {
                    console.log(`[Step2][${label}] ✓ FFmpeg complete in ${Math.round((Date.now() - start) / 1000)}s`);
                    resolve(undefined);
                }
                else {
                    reject(new Error(`FFmpeg exited with code ${code} in ${label}`));
                }
            });
            proc.on("error", (err) => {
                clearInterval(timeout);
                reject(err);
            });
        });
    };
    const ffmpegStart = Date.now();
    // ── STAGE 2A: MASTER VIDEO GENERATION ─────────────────────────────────
    const stage2aArgs = [
        "-y",
        "-nostdin",
        "-framerate", String(inputFps),
        "-i", framePattern,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        masterVideoPath
    ];
    await runFfmpeg(stage2aArgs, "Stage 2A: Master");
    // ── STAGE 2B: POST-PROCESS + VARIANTS ─────────────────────────────────
    const stage2bArgs = [
        "-y",
        "-nostdin",
        "-i", masterVideoPath,
        "-f", "lavfi",
        "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
    ];
    const filterParts = [];
    const outMaps = [];
    const encodeFlags = videoEncodeFlags.split(" ");
    if (aspects.length > 1) {
        const splits = aspects.map((_, i) => `[v${i + 1}]`).join("");
        filterParts.push(`[0:v]split=${aspects.length}${splits}`);
    }
    aspects.forEach((aspect, i) => {
        const inPad = aspects.length > 1 ? `[v${i + 1}]` : `[0:v]`;
        const gradedPad = `[g${i + 1}]`;
        const outPad = `[o${i + 1}]`;
        // 1. Subtle cinematic grade + Text Overlays
        const gradeFilter = `eq=contrast=1.1:saturation=1.2:brightness=0.02`;
        const watermarkText = `drawtext=text='JETMYMOTO':x=w-200:y=h-80:fontcolor=white@0.5:fontsize=24`;
        const titleText = `drawtext=text='ALPINE TRAVERSE':x=(w-text_w)/2:y=50:fontcolor=white:fontsize=48`;
        filterParts.push(`${inPad}${gradeFilter},${watermarkText},${titleText}${gradedPad}`);
        // 2. Scale output
        if (aspect === "16:9") {
            filterParts.push(`${gradedPad}scale=1280:720${outPad}`);
        }
        else if (aspect === "9:16") {
            filterParts.push(`${gradedPad}scale=720:1280${outPad}`);
        }
        else if (aspect === "1:1") {
            filterParts.push(`${gradedPad}scale=720:720${outPad}`);
        }
        outMaps.push("-map", outPad, "-map", "1:a");
        outMaps.push(...encodeFlags);
        outMaps.push("-c:a", "aac", "-shortest", aspectOutputMap[aspect]);
    });
    stage2bArgs.push("-filter_complex", filterParts.join("; "));
    stage2bArgs.push(...outMaps);
    await runFfmpeg(stage2bArgs, "Stage 2B: Variants");
    const ffmpegMs = Date.now() - ffmpegStart;
    log({ slug, event: "ffmpeg_complete", durationMs: ffmpegMs, encoder, gpu, aspects });
    console.log(`[Step2] ✓ Total FFmpeg complete in ${Math.round(ffmpegMs / 1000)}s`);
    // ── Upload all outputs ─────────────────────────────────────────────────
    const uploadedVideos = [];
    const publicUrls = [];
    const localOutputs = [];
    const aspectStorageMap = aspectStorageSuffixMap;
    const uploadStart = Date.now();
    for (const aspect of aspects) {
        const localPath = aspectOutputMap[aspect];
        const storageDest = aspectStorageMap[aspect];
        const downloadToken = randomUUID();
        localOutputs.push(localPath);
        await bucket.upload(localPath, {
            destination: storageDest,
            metadata: {
                contentType: "video/mp4",
                cacheControl: "public, max-age=31536000",
                metadata: {
                    firebaseStorageDownloadTokens: downloadToken,
                },
            },
        });
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storageDest)}?alt=media&token=${downloadToken}`;
        uploadedVideos.push(storageDest);
        publicUrls.push(publicUrl);
        console.log(`[Step2] ✓ Uploaded ${aspect}: gs://${bucket.name}/${storageDest}`);
        console.log(`[Step2] ✓ Public URL: ${publicUrl}`);
    }
    const uploadMs = Date.now() - uploadStart;
    log({ slug, event: "upload_complete", durationMs: uploadMs, uploadCount: uploadedVideos.length });
    // ── Cleanup ────────────────────────────────────────────────────────────
    if (!keepLocalFrames) {
        await fsp.rm(localSlugDir, { recursive: true, force: true });
        console.log(`[Step2] Local frames cleaned up`);
    }
    const totalMs = Date.now() - pipelineStart;
    log({
        slug,
        event: "complete",
        durationMs: totalMs,
        encoder,
        gpu,
        cacheHit,
        aspects,
        ffmpegMs,
        uploadMs,
        uploadCount: uploadedVideos.length,
    });
    console.log(`\n[Step2] ✅ ${aspects.length} video(s) built and uploaded.\n` +
        `[Step2] Total pipeline: ${Math.round(totalMs / 1000)}s ` +
        `(ffmpeg: ${Math.round(ffmpegMs / 1000)}s, upload: ${Math.round(uploadMs / 1000)}s)`);
    return { slug, uploadedVideos, publicUrls, localOutputs, outputSuffix: suffix || undefined };
}
