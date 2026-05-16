/**
 * buildFramePlan.ts
 *
 * Shared frame-plan builder for the 2-step render pipeline.
 * Encapsulates the 4-act camera sequence (Dive → Flyover → Overshoot → Settle)
 * and dual-geometry system. No FFmpeg or download logic here.
 */
import * as turf from "@turf/turf";
// ── Act boundaries (time-based, then scaled by totalFrames) ──────────────
const DEFAULT_DURATION_SECONDS = 24;
const DEFAULT_TOTAL_FRAMES = 150; // reduced-frame pipeline default
const ACT_SECONDS = {
    dive: 3,
    flyover: 17,
    overshoot: 2,
    settle: 2,
};
function resolveActFrames(totalFrames) {
    const totalSec = ACT_SECONDS.dive + ACT_SECONDS.flyover + ACT_SECONDS.overshoot + ACT_SECONDS.settle;
    const rawDive = Math.max(1, Math.round(totalFrames * (ACT_SECONDS.dive / totalSec)));
    const rawFlyover = Math.max(1, Math.round(totalFrames * (ACT_SECONDS.flyover / totalSec)));
    const rawOvershoot = Math.max(1, Math.round(totalFrames * (ACT_SECONDS.overshoot / totalSec)));
    let rawSettle = totalFrames - rawDive - rawFlyover - rawOvershoot;
    if (rawSettle < 1) {
        const deficit = 1 - rawSettle;
        rawSettle = 1;
        const adjustedFlyover = Math.max(1, rawFlyover - deficit);
        return {
            diveFrames: rawDive,
            flyoverFrames: adjustedFlyover,
            overshootFrames: rawOvershoot,
            settleFrames: rawSettle,
        };
    }
    return {
        diveFrames: rawDive,
        flyoverFrames: rawFlyover,
        overshootFrames: rawOvershoot,
        settleFrames: rawSettle,
    };
}
// ── Easing ────────────────────────────────────────────────────────────────
const CAMERA_LERP_SMOOTHING = 0.08;
const ZOOM_LERP_SMOOTHING = 0.05;
const lerp = (a, b, t) => a + (b - a) * t;
const lerpVec2 = (a, b, t) => [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
];
const lerpAngle = (a, b, t) => {
    const diff = (((b - a + 180) % 360) + 360) % 360 - 180;
    return (((a + diff * t) % 360) + 360) % 360;
};
const TRANSITION_MAP = {
    "drone_follow->chase": 10,
    "chase->reveal": 25,
    "reveal->orbit": 30,
    "push_in->drone_follow": 15,
};
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
// ── Polyline encoder ──────────────────────────────────────────────────────
export const encodePolyline = (points) => {
    const encodeValue = (val) => {
        let v = val < 0 ? ~(val << 1) : val << 1;
        let res = "";
        while (v >= 0x20) {
            res += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
            v >>= 5;
        }
        res += String.fromCharCode(v + 63);
        return res;
    };
    let result = "";
    let prevLat = 0;
    let prevLng = 0;
    for (const [lng, lat] of points) {
        const latE5 = Math.round(lat * 1e5);
        const lngE5 = Math.round(lng * 1e5);
        result += encodeValue(latE5 - prevLat);
        result += encodeValue(lngE5 - prevLng);
        prevLat = latE5;
        prevLng = lngE5;
    }
    return result;
};
// ── Geometry helpers ──────────────────────────────────────────────────────
const simplifyPath = (coords, step) => coords.filter((_, i) => i % step === 0 || i === coords.length - 1);
const buildCameraDrift = (frameCount) => {
    const drift = [];
    let dx = 0;
    let dy = 0;
    let curX = 0;
    let curY = 0;
    for (let i = 0; i < frameCount; i++) {
        const rx = Math.sin(i * 0.5) * 10000 % 1;
        const ry = Math.cos(i * 0.5) * 10000 % 1;
        dx += rx * 0.00004;
        dy += ry * 0.00004;
        dx *= 0.92;
        dy *= 0.92;
        curX += dx;
        curY += dy;
        drift.push([curX, curY]);
    }
    return drift;
};
// ── Main export ───────────────────────────────────────────────────────────
function getModeForFrame(frameIndex, plan) {
    for (const seg of plan) {
        if (frameIndex >= seg.startFrame && frameIndex < seg.endFrame) {
            return seg.mode;
        }
    }
    return plan[plan.length - 1]?.mode || "drone_follow";
}
function getTransitionContext(frameIndex, plan) {
    for (let s = 0; s < plan.length - 1; s++) {
        const boundary = plan[s + 1].startFrame;
        const modeA = plan[s].mode;
        const modeB = plan[s + 1].mode;
        const transitionFrames = TRANSITION_MAP[`${modeA}->${modeB}`] ?? 20;
        if (frameIndex >= boundary - transitionFrames && frameIndex <= boundary + transitionFrames) {
            const progress = (frameIndex - (boundary - transitionFrames)) / (transitionFrames * 2);
            return {
                modeA,
                modeB,
                progress: Math.max(0, Math.min(1, progress))
            };
        }
    }
    const currentMode = getModeForFrame(frameIndex, plan);
    return { modeA: currentMode, modeB: currentMode, progress: 0 };
}
/**
 * Build a frame plan from resolved route coordinates.
 * Requires coordinates already processed through buildRouteGeo.
 */
export function buildFramePlan(coords, options = {}) {
    if (!coords || coords.length < 2) {
        throw new Error("buildFramePlan: need at least 2 coordinates");
    }
    const frameCount = Math.max(1, Math.round(options.totalFrames ?? DEFAULT_TOTAL_FRAMES));
    const durationSeconds = options.durationSeconds ?? DEFAULT_DURATION_SECONDS;
    const defaultMode = options.cameraMode ?? "drone_follow";
    const directorPlan = options.routeAnalysis
        ? generateCameraPlan(options.routeAnalysis, frameCount)
        : [{ startFrame: 0, endFrame: frameCount, mode: defaultMode }];
    console.log("[DirectorPlan] Modes assigned across", frameCount, "frames.");
    const { diveFrames, flyoverFrames, overshootFrames, settleFrames } = resolveActFrames(frameCount);
    const cameraDrift = buildCameraDrift(frameCount);
    // CAMERA PATH: aggressively downsampled for silky motion
    const cameraCoords = simplifyPath(coords, 25);
    const cameraLine = turf.lineString(cameraCoords);
    const cameraLengthKm = turf.length(cameraLine, { units: "kilometers" });
    // OVERLAY PATH: road-hugging, ≤500 points
    const overlayLine = turf.lineString(coords);
    let simplifiedOverlay = turf.simplify(overlayLine, { tolerance: 0.00002, highQuality: true });
    let overlayCoords = simplifiedOverlay.geometry.coordinates;
    if (overlayCoords.length > 500) {
        const step = Math.ceil(overlayCoords.length / 500);
        overlayCoords = overlayCoords.filter((_, i) => i % step === 0 || i === overlayCoords.length - 1);
    }
    // Bounds
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const bounds = [
        Math.min(...lngs),
        Math.min(...lats),
        Math.max(...lngs),
        Math.max(...lats),
    ];
    // Pre-encode full polylines for metadata
    const fullRoutePolyline = encodePolyline(overlayCoords);
    const cameraRoutePolyline = encodePolyline(cameraCoords);
    // ── Per-frame camera state ─────────────────────────────────────────────
    const frames = [];
    let prevLngLat = null;
    let prevZoom = null;
    let prevBearing = null;
    let prevPitch = null;
    const calculateTarget = (mode, frameIndex, totalFrames) => {
        let targetLng = 0;
        let targetLat = 0;
        let targetZoom = 0;
        let targetBearing = 0;
        let targetPitch = 0;
        let routeProgress = 0;
        const t = frameIndex / totalFrames; // Global progress for static animations
        if (mode === "orbit") {
            const radiusKm = Math.max(1.5, cameraLengthKm * 0.15);
            const angle = (t * 360) % 360;
            const routeMidpoint = turf.along(cameraLine, cameraLengthKm / 2, { units: "kilometers" }).geometry.coordinates;
            const pos = turf.destination(turf.point(routeMidpoint), radiusKm, angle, { units: "kilometers" }).geometry.coordinates;
            targetLng = pos[0];
            targetLat = pos[1];
            targetZoom = 11.5;
            targetBearing = (angle + 180) % 360;
            targetPitch = 50;
            routeProgress = 1.0;
        }
        else if (mode === "push_in") {
            targetLng = cameraCoords[0][0];
            targetLat = cameraCoords[0][1];
            targetZoom = lerp(8, 13.5, easeInOutCubic(t));
            targetBearing = (turf.bearing(turf.point(cameraCoords[0]), turf.point(cameraCoords[1])) + 360) % 360;
            targetPitch = 45;
            routeProgress = t;
        }
        else if (mode === "reveal") {
            targetLng = cameraCoords[0][0];
            targetLat = cameraCoords[0][1];
            targetZoom = lerp(7, 11.5, easeInOutCubic(t));
            targetPitch = lerp(60, 15, easeInOutCubic(t));
            targetBearing = 0;
            routeProgress = t;
        }
        else {
            // Standard Act-Based (drone_follow, chase)
            if (frameIndex < diveFrames) {
                const progress = frameIndex / diveFrames;
                const eased = easeInOutCubic(progress);
                const routeMidpoint = turf.along(cameraLine, cameraLengthKm / 2, { units: "kilometers" }).geometry.coordinates;
                targetLng = routeMidpoint[0] + (cameraCoords[0][0] - routeMidpoint[0]) * eased;
                targetLat = routeMidpoint[1] + (cameraCoords[0][1] - routeMidpoint[1]) * eased;
                targetZoom = 2.5 + (10.0 - 2.5) * eased;
                targetPitch = 0 + 60 * eased;
                targetBearing = turf.bearing(turf.point([targetLng, targetLat]), turf.point(cameraCoords[1])) * eased;
                routeProgress = 0;
            }
            else if (frameIndex < diveFrames + flyoverFrames) {
                const flyoverFrame = frameIndex - diveFrames;
                const progress = flyoverFrame / flyoverFrames;
                const eased = easeInOutCubic(progress);
                const biasFactor = mode === "chase" ? 0.08 : 0;
                const currentDistance = cameraLengthKm * Math.min(1, progress + biasFactor);
                const basePoint = turf.along(cameraLine, currentDistance, { units: "kilometers" }).geometry.coordinates;
                const drift = cameraDrift[frameIndex];
                targetLng = basePoint[0] + drift[0];
                targetLat = basePoint[1] + drift[1];
                const lookAheadDist = Math.min(cameraLengthKm, currentDistance + Math.max(cameraLengthKm * 0.05, 5));
                const lookAheadPoint = turf.along(cameraLine, lookAheadDist, { units: "kilometers" }).geometry.coordinates;
                targetBearing = (turf.bearing(turf.point([targetLng, targetLat]), turf.point(lookAheadPoint)) + 360) % 360;
                const baseZoom = eased < 0.2 ? 10.0 + (eased / 0.2) * (11.0 - 10.0)
                    : eased < 0.8 ? 11.0 + ((eased - 0.2) / 0.6) * (12.0 - 11.0)
                        : 12.0 + ((eased - 0.8) / 0.2) * (12.5 - 12.0);
                targetZoom = mode === "chase" ? baseZoom + 0.8 : baseZoom;
                targetPitch = 60 + 5 * eased;
                routeProgress = eased;
            }
            else {
                const settleFrame = frameIndex - (diveFrames + flyoverFrames);
                const settleProgress = settleFrame / (overshootFrames + settleFrames);
                const eased = easeOutQuart(settleProgress);
                const dest = coords[coords.length - 1];
                targetLng = dest[0];
                targetLat = dest[1];
                if (settleProgress < 0.5) {
                    targetZoom = 12.5 + 0.7 * (settleProgress * 2);
                }
                else {
                    targetZoom = 13.2 - 0.4 * ((settleProgress - 0.5) * 2);
                }
                const finalBearing = turf.bearing(turf.point(coords[coords.length - 2]), turf.point(coords[coords.length - 1]));
                targetBearing = ((finalBearing + 360) % 360) + 5 * eased;
                targetPitch = 65 - 5 * eased;
                routeProgress = 1;
            }
        }
        return { targetLng, targetLat, targetZoom, targetBearing, targetPitch, routeProgress };
    };
    for (let i = 0; i < frameCount; i++) {
        const { modeA, modeB, progress } = getTransitionContext(i, directorPlan);
        const targetA = calculateTarget(modeA, i, frameCount);
        let finalTarget = targetA;
        if (progress > 0 && modeA !== modeB) {
            const targetB = calculateTarget(modeB, i, frameCount);
            finalTarget = {
                targetLng: lerp(targetA.targetLng, targetB.targetLng, progress),
                targetLat: lerp(targetA.targetLat, targetB.targetLat, progress),
                targetZoom: lerp(targetA.targetZoom, targetB.targetZoom, progress),
                targetBearing: lerpAngle(targetA.targetBearing, targetB.targetBearing, progress),
                targetPitch: lerp(targetA.targetPitch, targetB.targetPitch, progress),
                routeProgress: lerp(targetA.routeProgress, targetB.routeProgress, progress),
            };
        }
        const { targetLng, targetLat, targetZoom, targetBearing, targetPitch, routeProgress } = finalTarget;
        const smoothingA = modeA === "chase" ? 0.15 : CAMERA_LERP_SMOOTHING;
        const zoomSmoothingA = modeA === "chase" ? 0.10 : ZOOM_LERP_SMOOTHING;
        let currentSmoothing = smoothingA;
        let currentZoomSmoothing = zoomSmoothingA;
        if (progress > 0 && modeA !== modeB) {
            const smoothingB = modeB === "chase" ? 0.15 : CAMERA_LERP_SMOOTHING;
            const zoomSmoothingB = modeB === "chase" ? 0.10 : ZOOM_LERP_SMOOTHING;
            const easeProgress = easeInOutCubic(progress);
            currentSmoothing = lerp(smoothingA, smoothingB, easeProgress);
            currentZoomSmoothing = lerp(zoomSmoothingA, zoomSmoothingB, easeProgress);
        }
        // Safe fallback: initialize from first computed target state
        if (prevLngLat === null)
            prevLngLat = [targetLng, targetLat];
        if (prevZoom === null)
            prevZoom = targetZoom;
        if (prevBearing === null)
            prevBearing = targetBearing;
        if (prevPitch === null)
            prevPitch = targetPitch;
        const smoothedLngLat = lerpVec2(prevLngLat, [targetLng, targetLat], currentSmoothing);
        const smoothedZoom = lerp(prevZoom, targetZoom, currentZoomSmoothing);
        const smoothedBearing = lerpAngle(prevBearing, targetBearing, currentSmoothing);
        const smoothedPitch = lerp(prevPitch, targetPitch, currentSmoothing);
        // Update state for next frame
        prevLngLat = smoothedLngLat;
        prevZoom = smoothedZoom;
        prevBearing = smoothedBearing;
        prevPitch = smoothedPitch;
        // Use smoothed values for final entry
        let [lng, lat] = smoothedLngLat;
        let zoom = smoothedZoom;
        let bearing = smoothedBearing;
        let pitch = smoothedPitch;
        // Clamp for Mapbox Static API limits
        zoom = Math.max(0, Math.min(22, zoom));
        pitch = Math.max(0, Math.min(60, pitch));
        frames.push({
            frameIndex: i,
            lng,
            lat,
            zoom,
            bearing,
            pitch,
            routeProgress,
        });
    }
    return {
        totalFrames: frameCount,
        durationSeconds,
        diveFrames,
        flyoverFrames,
        overshootFrames,
        settleFrames,
        bounds,
        routePoints: coords.length,
        fullRoutePolyline,
        cameraRoutePolyline,
        frames,
    };
}
/**
 * Build the Mapbox Static API URL for one frame.
 * Bakes route glow + core overlays into the frame — Step 1 responsibility.
 */
export function buildFrameUrl(entry, overlayCoords, framePlan, token) {
    // Progressive reveal based on routeProgress
    const DIVE_FRAMES_LOCAL = framePlan.diveFrames;
    const FLYOVER_FRAMES_LOCAL = framePlan.flyoverFrames;
    const i = entry.frameIndex;
    let visibleCoords;
    if (i < DIVE_FRAMES_LOCAL) {
        visibleCoords = overlayCoords.slice(0, 2);
    }
    else if (i < DIVE_FRAMES_LOCAL + FLYOVER_FRAMES_LOCAL) {
        const flyoverProgress = (i - DIVE_FRAMES_LOCAL) / FLYOVER_FRAMES_LOCAL;
        const visibleCount = Math.max(2, Math.round(flyoverProgress * overlayCoords.length));
        visibleCoords = overlayCoords.slice(0, visibleCount);
    }
    else {
        visibleCoords = overlayCoords;
    }
    const poly = encodeURIComponent(encodePolyline(visibleCoords));
    const glowPath = `path-24+CDA755-0.6(${poly})`;
    const corePath = `path-5+ffffff-1.0(${poly})`;
    const overlay = `${glowPath},${corePath}`;
    return (`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/` +
        `${overlay}/` +
        `${entry.lng},${entry.lat},${entry.zoom},${entry.bearing},${entry.pitch}/` +
        `1280x720@2x?access_token=${token}`);
}
/**
 * Derive overlay coords from full route for use in URL building.
 * Exported so Step 1 can call it once and pass to buildFrameUrl.
 */
export function buildOverlayCoords(coords) {
    const overlayLine = turf.lineString(coords);
    const simplified = turf.simplify(overlayLine, { tolerance: 0.00002, highQuality: true });
    let overlayCoords = simplified.geometry.coordinates;
    if (overlayCoords.length > 500) {
        const step = Math.ceil(overlayCoords.length / 500);
        overlayCoords = overlayCoords.filter((_, i) => i % step === 0 || i === overlayCoords.length - 1);
    }
    return overlayCoords;
}
// ── Auto Director ─────────────────────────────────────────────────────────
/**
 * Automatically assign cinematic camera modes across the route.
 */
export function generateCameraPlan(routeAnalysis, frameCount) {
    const segments = [];
    const START_PCT = 0.15;
    const END_PCT = 0.15;
    const MIN_FRAMES = 10;
    const startEndFrame = Math.floor(frameCount * START_PCT);
    const finalStartFrame = frameCount - Math.floor(frameCount * END_PCT);
    // 1. START (first 10–15% of frames) → mode = "push_in"
    segments.push({
        startFrame: 0,
        endFrame: startEndFrame,
        mode: "push_in",
    });
    const numDataPoints = Math.max(routeAnalysis.curvaturePerSegment?.length || 0, routeAnalysis.elevationProfile?.length || 0, 1);
    const maxElevation = routeAnalysis.elevationProfile?.length > 0
        ? Math.max(...routeAnalysis.elevationProfile)
        : 0;
    let currentMode = "drone_follow";
    let currentStart = startEndFrame;
    for (let f = startEndFrame; f < finalStartFrame; f++) {
        const routeProgress = f / frameCount;
        const dataIndex = Math.min(numDataPoints - 1, Math.floor(routeProgress * numDataPoints));
        const curvature = routeAnalysis.curvaturePerSegment?.[dataIndex] ?? 0;
        const elevation = routeAnalysis.elevationProfile?.[dataIndex] ?? 0;
        const isPeak = routeAnalysis.keyPoints?.peaks?.includes(dataIndex) ||
            (maxElevation > 0 && elevation >= maxElevation * 0.95);
        let targetMode = "drone_follow"; // 4. LONG STRAIGHT / LOW CURVATURE
        if (isPeak) {
            // 3. PEAK / HIGH ELEVATION
            targetMode = "reveal";
        }
        else if (curvature > 0.7) {
            // 2. HIGH CURVATURE segments
            targetMode = "chase";
        }
        // Switch mode if we meet MIN_FRAMES or it's the very first middle frame
        if (targetMode !== currentMode) {
            if (f - currentStart >= MIN_FRAMES) {
                segments.push({
                    startFrame: currentStart,
                    endFrame: f,
                    mode: currentMode,
                });
                currentMode = targetMode;
                currentStart = f;
            }
        }
    }
    // Close the last middle segment
    if (currentStart < finalStartFrame) {
        segments.push({
            startFrame: currentStart,
            endFrame: finalStartFrame,
            mode: currentMode,
        });
    }
    // 5. END (last 10–15%) → mode = "orbit"
    segments.push({
        startFrame: finalStartFrame,
        endFrame: frameCount,
        mode: "orbit",
    });
    // 6. Ensure smooth transitions & MIN_FRAMES enforcement
    const merged = [];
    for (const seg of segments) {
        if (merged.length > 0 && merged[merged.length - 1].mode === seg.mode) {
            merged[merged.length - 1].endFrame = seg.endFrame;
        }
        else {
            merged.push({ ...seg });
        }
    }
    // Swallow segments smaller than MIN_FRAMES (except start/end boundaries)
    for (let i = 1; i < merged.length - 1; i++) {
        if (merged[i].endFrame - merged[i].startFrame < MIN_FRAMES) {
            merged[i - 1].endFrame = merged[i].endFrame;
            merged[i].startFrame = -1; // mark for deletion
        }
    }
    const finalSegments = merged.filter((s) => s.startFrame !== -1);
    // Fix continuity gaps
    for (let i = 1; i < finalSegments.length; i++) {
        finalSegments[i].startFrame = finalSegments[i - 1].endFrame;
    }
    // 7. Add debug logging
    console.log("[AutoDirectorPlan]", finalSegments);
    return finalSegments;
}
