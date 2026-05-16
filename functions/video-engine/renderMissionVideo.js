/**
 * renderMissionVideo.ts — Thin orchestrator (refactored)
 *
 * Delegates to:
 *   - step1_downloadFrames (Mapbox frame acquisition)
 *   - step2_buildVideo     (FFmpeg composition)
 *
 * Existing Cloud Function entrypoints (generateMissionVideo.js,
 * processMissionVideoJob.js) call this function and are unaffected.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as turf from "@turf/turf";
import { downloadFrames } from "./step1_downloadFrames.js";
import { buildVideo } from "./step2_buildVideo.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export async function renderMissionVideo(mission, options = {}) {
    const slug = mission.slug || "mission";
    const step = options.step ?? "all";
    // Derive mission metrics for Step 2 display overlays
    const coords = mission.coordinates;
    if (!coords || coords.length < 2)
        throw new Error("[renderMissionVideo] Invalid coordinates");
    const routeLine = turf.lineString(coords);
    const totalLengthKm = Math.round(turf.length(routeLine, { units: "kilometers" }));
    const ridingTimeHours = Math.max(1, Math.round(totalLengthKm / 65));
    const subsidyPct = mission.price_radar?.subsidy_pct ?? 40;
    const savings = Math.round(totalLengthKm * 0.8 * (subsidyPct / 100));
    const outputPath = options.outputLocation ??
        mission.outputLocation ??
        path.resolve(__dirname, "output", `${slug}.mp4`);
    if (!options.bucket) {
        throw new Error("[renderMissionVideo] options.bucket (Firebase Storage Bucket) is required. " +
            "Pass it from your Cloud Function entrypoint.");
    }
    const bucket = options.bucket;
    const localTempBaseDir = path.resolve(__dirname, "temp_frames");
    const step1Input = {
        slug,
        insertion_airport: mission.insertion_airport,
        extraction_airport: mission.extraction_airport,
        coordinates: mission.coordinates,
        road_coordinates: mission.road_coordinates,
    };
    const step2Input = {
        slug,
        insertion_airport: mission.insertion_airport,
        extraction_airport: mission.extraction_airport,
        totalLengthKm,
        ridingTimeHours,
        savings,
    };
    // ── Step 1: Frame acquisition ──────────────────────────────────────────
    if (step === "1" || step === "all") {
        await downloadFrames(step1Input, {
            bucket,
            localTempBaseDir,
            keepLocalFrames: options.keepFrames ?? false,
        });
    }
    // ── Step 2: Video composition ──────────────────────────────────────────
    if (step === "2" || step === "all") {
        await buildVideo(step2Input, {
            bucket,
            localTempBaseDir,
            keepLocalFrames: options.keepFrames ?? false,
            variant: {
                hookText: mission.hook_text,
                ctaText: mission.cta_text,
            },
        });
    }
    return outputPath;
}
