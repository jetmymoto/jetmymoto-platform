/**
 * storageManifest.ts
 *
 * Centralizes Firebase Storage path generation, manifest construction,
 * and completion validation for the 2-step render pipeline.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
// ── Storage paths ─────────────────────────────────────────────────────────
export const FRAMES_BUCKET = "mapboxrawframes";
export const VIDEOS_BUCKET = "ffmpeg1";
export function getFrameStoragePaths(slug, imageFormat = "png") {
    const base = `${FRAMES_BUCKET}/${slug}`;
    return {
        framesDir: `${base}/frames/`,
        metadataFile: `${base}/metadata.json`,
        cameraStateFile: `${base}/camera_state.json`,
        manifestFile: `${base}/manifest.json`,
        completeFile: `${base}/complete.json`,
        archiveFile: `${base}/archive/frames.tar.gz`,
        frameFile: (index) => `${base}/frames/frame_${String(index).padStart(4, "0")}.${imageFormat}`,
    };
}
export function getVideoStoragePaths(slug) {
    const base = `${VIDEOS_BUCKET}/${slug}`;
    return {
        landscapeVideo: `${base}/${slug}.mp4`,
        portraitVideo: `${base}/${slug}_9x16.mp4`,
        squareVideo: `${base}/${slug}_1x1.mp4`,
    };
}
// ── Manifest builders ─────────────────────────────────────────────────────
export function buildManifest(totalFrames, imageFormat = "png") {
    const files = [];
    for (let i = 0; i < totalFrames; i++) {
        files.push(`frame_${String(i).padStart(4, "0")}.${imageFormat}`);
    }
    return { totalFrames, files };
}
export function buildCompleteMarker(frameCount) {
    return {
        status: "complete",
        frameCount,
        completedAt: new Date().toISOString(),
    };
}
/**
 * Validate a manifest against what is actually present in a local directory.
 */
export function validateManifestAgainstLocalDir(manifest, localFrameDir) {
    if (!existsSync(localFrameDir)) {
        return { valid: false, reason: `Frame directory does not exist: ${localFrameDir}` };
    }
    const presentFiles = new Set(readdirSync(localFrameDir));
    const missing = manifest.files.filter((f) => !presentFiles.has(f));
    if (missing.length > 0) {
        return {
            valid: false,
            reason: `${missing.length} frame(s) missing from local directory`,
            missingFrames: missing,
        };
    }
    return { valid: true };
}
/**
 * Validate that a manifest covers the expected frame count.
 */
export function validateManifestShape(manifest, expectedFrames) {
    if (manifest.totalFrames !== expectedFrames) {
        return {
            valid: false,
            reason: `Manifest totalFrames (${manifest.totalFrames}) does not match expected (${expectedFrames})`,
        };
    }
    if (manifest.files.length !== expectedFrames) {
        return {
            valid: false,
            reason: `Manifest files array length (${manifest.files.length}) does not match totalFrames (${expectedFrames})`,
        };
    }
    return { valid: true };
}
/**
 * Validate a complete marker.
 */
export function validateCompleteMarker(marker, expectedFrames) {
    if (marker.status !== "complete") {
        return { valid: false, reason: `complete.json status is "${marker.status}", expected "complete"` };
    }
    if (marker.frameCount !== expectedFrames) {
        return {
            valid: false,
            reason: `complete.json frameCount (${marker.frameCount}) does not match expected (${expectedFrames})`,
        };
    }
    return { valid: true };
}
/**
 * Strict manifest validation:
 *   1. Exact filename match between manifest and local directory
 *   2. All expected sequential indices present (no gaps)
 *   3. No zero-byte / corrupted files (statSync size > 0)
 *
 * Replaces the permissive validateManifestAgainstLocalDir for Step 2.
 */
export function validateManifestStrict(manifest, localFrameDir) {
    if (!existsSync(localFrameDir)) {
        return { valid: false, reason: `Frame directory does not exist: ${localFrameDir}` };
    }
    const manifestSet = new Set(manifest.files);
    const localFiles = new Set(readdirSync(localFrameDir));
    // Check every manifest entry is present and non-empty
    const missing = [];
    const corrupted = [];
    for (const filename of manifest.files) {
        if (!localFiles.has(filename)) {
            missing.push(filename);
            continue;
        }
        const stat = statSync(`${localFrameDir}/${filename}`);
        if (stat.size === 0) {
            corrupted.push(filename);
        }
    }
    if (missing.length > 0) {
        return {
            valid: false,
            reason: `${missing.length} frame(s) listed in manifest are missing locally`,
            missingFrames: missing,
        };
    }
    if (corrupted.length > 0) {
        return {
            valid: false,
            reason: `${corrupted.length} frame(s) are zero-byte (corrupted): ${corrupted.slice(0, 5).join(", ")}`,
            missingFrames: corrupted,
        };
    }
    // Validate sequential indices — no gaps in frame_NNNN naming
    const ext = manifest.files[0]?.split(".").pop() ?? "png";
    for (let i = 0; i < manifest.totalFrames; i++) {
        const expected = `frame_${String(i).padStart(4, "0")}.${ext}`;
        if (!manifestSet.has(expected)) {
            return {
                valid: false,
                reason: `Sequential index gap detected — ${expected} missing from manifest`,
            };
        }
    }
    return { valid: true };
}
