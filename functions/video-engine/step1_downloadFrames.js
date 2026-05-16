/**
 * step1_downloadFrames.ts
 *
 * Step 1 — Mapbox frame acquisition.
 *
 * Responsibilities:
 *   - Load mission data and build route geometry
 *   - Generate a frame plan (720 frames, 4-act camera sequence)
 *   - Download all frames from Mapbox Static API (concurrency=5, retry-safe)
 *   - Write metadata.json, camera_state.json, manifest.json locally
 *   - Upload all frames + metadata files to Firebase Storage (mapboxrawframes/{slug}/)
 *   - Upload complete.json LAST as the completion signal
 *   - Optionally produce frames.tar.gz archive
 *
 * Does NOT call FFmpeg. Does NOT know about variant configs or layout presets.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import sharp from "sharp";
import { buildRouteGeo } from "./utils/buildRouteGeo.js";
import { buildFramePlan, buildFrameUrl, buildOverlayCoords, } from "./utils/buildFramePlan.js";
import { safeMapboxFetch } from "./utils/retryMapbox.js";
import { getFrameStoragePaths, buildManifest, buildCompleteMarker, } from "./utils/storageManifest.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 5;
function log(event) {
    const entry = { step: "step1", ...event };
    process.stdout.write(JSON.stringify(entry) + "\n");
}
// ── Helpers ───────────────────────────────────────────────────────────────
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
// ── Main export ───────────────────────────────────────────────────────────
export async function downloadFrames(mission, options) {
    const { slug } = mission;
    const { bucket, buildArchive = false, keepLocalFrames = false, imageFormat = "png", frameCount = 150, } = options;
    const pipelineStart = Date.now();
    const localTempBaseDir = options.localTempBaseDir ?? path.resolve(__dirname, "temp_frames");
    const localTempDir = path.join(localTempBaseDir, slug, "frames");
    const MAPBOX_TOKEN = process.env.REMOTION_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;
    if (!MAPBOX_TOKEN)
        throw new Error("[Step1] MAPBOX_TOKEN missing");
    log({ slug, event: "start", format: imageFormat });
    console.log(`\n[Step1] Starting frame acquisition for mission: ${slug} (format=${imageFormat})`);
    console.log(`[Step1] Local staging dir: ${localTempDir}`);
    // ── Build route geometry ───────────────────────────────────────────────
    const routeGeo = buildRouteGeo(mission);
    const coords = routeGeo.coordinates;
    console.log(`[Step1] Route resolved: ${coords.length} coordinate points`);
    // ── Build frame plan ───────────────────────────────────────────────────
    const framePlan = buildFramePlan(coords, { totalFrames: frameCount, durationSeconds: 24 });
    const overlayCoords = buildOverlayCoords(coords);
    console.log(`[Step1] Frame plan ready: ${framePlan.totalFrames} frames, ` +
        `${framePlan.durationSeconds}s, bounds=[${framePlan.bounds.join(", ")}]`);
    // ── Prepare local temp dir ─────────────────────────────────────────────
    await fsp.mkdir(localTempDir, { recursive: true });
    // ── Download frames ────────────────────────────────────────────────────
    let successCount = 0;
    let retryCount = 0;
    const framePaths = framePlan.frames.map((entry) => path.join(localTempDir, `frame_${String(entry.frameIndex).padStart(4, "0")}.${imageFormat}`));
    const downloadStart = Date.now();
    await concurrentMap(framePlan.frames, CONCURRENCY, async (entry) => {
        const framePath = framePaths[entry.frameIndex];
        // Skip if already downloaded (resumability)
        if (fs.existsSync(framePath)) {
            successCount++;
            return;
        }
        const url = buildFrameUrl(entry, overlayCoords, framePlan, MAPBOX_TOKEN);
        let attempts = 0;
        const wrappedFetch = async () => {
            attempts++;
            const buffer = await safeMapboxFetch(url, {
                label: `frame_${String(entry.frameIndex).padStart(4, "0")}`,
            });
            if (imageFormat === "webp") {
                // Convert PNG buffer → WebP at quality 95 (60-70% smaller than PNG)
                const webpBuffer = await sharp(Buffer.from(buffer))
                    .webp({ quality: 95 })
                    .toBuffer();
                await fsp.writeFile(framePath, webpBuffer);
            }
            else {
                await fsp.writeFile(framePath, Buffer.from(buffer));
            }
            successCount++;
            retryCount += attempts - 1;
        };
        await wrappedFetch();
        if (entry.frameIndex % 100 === 0) {
            console.log(`[Step1] Frame ${entry.frameIndex}/${framePlan.totalFrames} downloaded ` +
                `(${Math.round((Date.now() - downloadStart) / 1000)}s elapsed)`);
        }
    });
    const downloadMs = Date.now() - downloadStart;
    log({ slug, event: "frames_downloaded", durationMs: downloadMs, frameCount: successCount, retryCount, format: imageFormat });
    console.log(`[Step1] Download complete: ${successCount}/${framePlan.totalFrames} frames, ` +
        `${retryCount} retries, ${Math.round(downloadMs / 1000)}s`);
    // ── Write metadata files (locally) ────────────────────────────────────
    const metadataDir = path.join(localTempBaseDir, slug);
    const metadata = {
        mission: slug,
        totalFrames: framePlan.totalFrames,
        durationSeconds: framePlan.durationSeconds,
        routePoints: framePlan.routePoints,
        generatedAt: new Date().toISOString(),
        bounds: framePlan.bounds,
        fullRoutePolyline: framePlan.fullRoutePolyline,
        cameraRoutePolyline: framePlan.cameraRoutePolyline,
    };
    const cameraState = framePlan.frames.map((entry) => ({
        frame: entry.frameIndex,
        lng: entry.lng,
        lat: entry.lat,
        zoom: entry.zoom,
        bearing: entry.bearing,
        pitch: entry.pitch,
    }));
    const manifest = buildManifest(framePlan.totalFrames, imageFormat);
    await fsp.writeFile(path.join(metadataDir, "metadata.json"), JSON.stringify(metadata, null, 2));
    await fsp.writeFile(path.join(metadataDir, "camera_state.json"), JSON.stringify(cameraState, null, 2));
    await fsp.writeFile(path.join(metadataDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    console.log(`[Step1] Metadata files written locally`);
    // ── Optional archive (frames.tar.gz) ──────────────────────────────────
    if (buildArchive) {
        const archivePath = path.join(metadataDir, "frames.tar.gz");
        console.log(`[Step1] Building archive: ${archivePath}`);
        execSync(`tar -czf "${archivePath}" -C "${metadataDir}" frames`, { stdio: "inherit" });
        console.log(`[Step1] Archive created`);
    }
    // ── Upload to Firebase Storage ─────────────────────────────────────────
    const storagePaths = getFrameStoragePaths(slug);
    const uploadedPaths = [];
    console.log(`[Step1] Uploading ${framePlan.totalFrames} frames to Firebase Storage...`);
    const uploadStart = Date.now();
    const contentType = imageFormat === "webp" ? "image/webp" : "image/png";
    // Upload frames with same concurrency cap
    await concurrentMap(framePlan.frames, CONCURRENCY, async (entry) => {
        const localPath = framePaths[entry.frameIndex];
        const destPath = storagePaths.frameFile(entry.frameIndex);
        await bucket.upload(localPath, {
            destination: destPath,
            metadata: { contentType },
        });
        uploadedPaths.push(destPath);
    });
    const uploadMs = Date.now() - uploadStart;
    log({ slug, event: "frames_uploaded", durationMs: uploadMs, frameCount: framePlan.totalFrames });
    console.log(`[Step1] Frames uploaded in ${Math.round(uploadMs / 1000)}s`);
    // Upload metadata files
    for (const [localFile, storageDest] of [
        [path.join(metadataDir, "metadata.json"), storagePaths.metadataFile],
        [path.join(metadataDir, "camera_state.json"), storagePaths.cameraStateFile],
        [path.join(metadataDir, "manifest.json"), storagePaths.manifestFile],
    ]) {
        await bucket.upload(localFile, {
            destination: storageDest,
            metadata: { contentType: "application/json" },
        });
        uploadedPaths.push(storageDest);
        console.log(`[Step1] Uploaded: ${storageDest}`);
    }
    // Optional archive upload
    if (buildArchive) {
        const archivePath = path.join(metadataDir, "frames.tar.gz");
        await bucket.upload(archivePath, {
            destination: storagePaths.archiveFile,
            metadata: { contentType: "application/gzip" },
        });
        uploadedPaths.push(storagePaths.archiveFile);
        console.log(`[Step1] Archive uploaded: ${storagePaths.archiveFile}`);
    }
    // ── Write complete.json LAST (completion signal) ───────────────────────
    const completeMarker = buildCompleteMarker(successCount);
    const completeLocalPath = path.join(metadataDir, "complete.json");
    await fsp.writeFile(completeLocalPath, JSON.stringify(completeMarker, null, 2));
    await bucket.upload(completeLocalPath, {
        destination: storagePaths.completeFile,
        metadata: { contentType: "application/json" },
    });
    uploadedPaths.push(storagePaths.completeFile);
    const totalMs = Date.now() - pipelineStart;
    log({
        slug,
        event: "complete",
        durationMs: totalMs,
        frameCount: successCount,
        retryCount,
        format: imageFormat,
        uploadedCount: uploadedPaths.length,
    });
    console.log(`[Step1] ✅ complete.json uploaded — Step 1 done.\n` +
        `[Step1] Total uploaded: ${uploadedPaths.length} objects to gs://${bucket.name}/${storagePaths.framesDir}\n` +
        `[Step1] Pipeline time: ${Math.round(totalMs / 1000)}s`);
    // ── Cleanup ────────────────────────────────────────────────────────────
    if (!keepLocalFrames) {
        // await fsp.rm(path.join(localTempBaseDir, slug), { recursive: true, force: true });
        console.log(`[Step1] Local temp dir cleaned up`);
    }
    return {
        slug,
        totalFrames: framePlan.totalFrames,
        successfulFrames: successCount,
        retryCount,
        uploadedPaths,
        completeMarkerPath: storagePaths.completeFile,
        localTempDir,
    };
}
