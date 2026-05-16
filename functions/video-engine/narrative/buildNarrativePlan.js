import { resolveArchetypeProfile, } from "./archetypeProfiles.js";
import { allocateRuntime } from "./narrativeTiming.js";
import { resolveWaypointTreatment } from "./waypointTreatments.js";
import { buildMonetizationMoments, } from "./monetizationMapping.js";
function toUpper(text) {
    return String(text || "").trim().toUpperCase();
}
function mapGradeToStylePreset(grade) {
    if (grade === "clean_bright")
        return "clean_bright";
    if (grade === "cinematic_cool")
        return "tactical";
    return "hero_amber";
}
function resolveHookType(tour, profile) {
    if (tour.sales_triggers?.hook_type)
        return tour.sales_triggers.hook_type;
    if (tour.sales_triggers?.urgency_text)
        return "urgency";
    if (tour.sales_triggers?.price_anchor_text)
        return "savings";
    return profile.hookType;
}
function buildOpeningHook(tour, profile, hookSec) {
    const hookType = resolveHookType(tour, profile);
    const stylePreset = mapGradeToStylePreset(profile.visualStyle.gradePreset);
    const textPrimary = toUpper(tour.sales_triggers?.hook_text) ||
        toUpper(tour.title) ||
        "GRAND TOUR";
    let textSecondary;
    if (hookType === "urgency" && tour.sales_triggers?.urgency_text) {
        textSecondary = toUpper(tour.sales_triggers.urgency_text);
    }
    else if (tour.subtitle) {
        textSecondary = toUpper(tour.subtitle);
    }
    else if (tour.duration_days && tour.distance_km) {
        textSecondary = `${tour.duration_days} DAYS. ${Math.round(tour.distance_km)} KM.`;
    }
    return {
        type: hookType,
        textPrimary,
        textSecondary,
        startSec: 0,
        endSec: hookSec,
        stylePreset,
    };
}
function resolveNarrativeRole(index, total) {
    if (total <= 1)
        return "arrival";
    if (index === 0)
        return "entry";
    if (index === total - 1)
        return total === 2 ? "arrival" : "arrival";
    return total === 3 && index === 1 ? "peak" : "build";
}
function normalizePhases(phases) {
    if (!phases || phases.length === 0) {
        return [{ phaseId: 1, title: "THE JOURNEY", region: "" }];
    }
    return phases.map((phase, idx) => ({
        phaseId: phase.phase_id ?? idx + 1,
        title: toUpper(phase.title) || `PHASE ${idx + 1}`,
        region: phase.region ?? "",
    }));
}
function groupPhases(phases, actCount) {
    if (phases.length <= actCount)
        return phases.map((p) => [p]);
    if (actCount === 1)
        return [phases];
    if (actCount === 2)
        return [phases.slice(0, 1), phases.slice(1)];
    return [phases.slice(0, 1), phases.slice(1, -1), phases.slice(-1)];
}
function normalizeSegments(tour) {
    if (tour.daily_segments && tour.daily_segments.length > 0) {
        return tour.daily_segments;
    }
    if (tour.waypoints && tour.waypoints.length > 0) {
        return [
            {
                day: 1,
                title: tour.title ?? "DAY 1",
                segment_index: 0,
                waypoints: tour.waypoints,
            },
        ];
    }
    return [
        {
            day: 1,
            title: tour.title ?? "DAY 1",
            segment_index: 0,
            waypoints: [],
        },
    ];
}
function assignSegmentsToActs(segments, actCount) {
    if (actCount <= 1)
        return [segments];
    const total = segments.length;
    const base = Math.floor(total / actCount);
    const remainder = total % actCount;
    const buckets = [];
    let cursor = 0;
    for (let i = 0; i < actCount; i++) {
        const size = base + (i < remainder ? 1 : 0);
        buckets.push(segments.slice(cursor, cursor + size));
        cursor += size;
    }
    return buckets.map((bucket, idx) => (bucket.length === 0 ? segments.slice(idx, idx + 1) : bucket));
}
function buildScenesForAct(segments, actStart, actEnd, profile, globalOffset, totalSegments) {
    const duration = Math.max(0, actEnd - actStart);
    const perSegment = segments.length > 0 ? duration / segments.length : duration;
    return segments.map((segment, index) => {
        const startSec = Number((actStart + perSegment * index).toFixed(2));
        const endSec = Number((actStart + perSegment * (index + 1)).toFixed(2));
        const globalIndex = globalOffset + index;
        const fromProgress = Number((globalIndex / totalSegments).toFixed(4));
        const toProgress = Number(((globalIndex + 1) / totalSegments).toFixed(4));
        const moments = (segment.waypoints ?? []).map((waypoint) => {
            const treatment = resolveWaypointTreatment(waypoint.type);
            const rawType = String(waypoint.type || "unknown").toLowerCase();
            const allowedTypes = [
                "scenic_pass",
                "technical_climb",
                "fuel_stop",
                "hotel_arrival",
                "sponsor_marker",
                "border_crossing",
                "viewpoint",
                "unknown",
            ];
            const normalizedType = (allowedTypes.includes(rawType) ? rawType : "unknown");
            return {
                waypointSlug: waypoint.slug,
                type: normalizedType,
                emphasis: waypoint.sponsor_id ? "high" : treatment.emphasis,
                visualTreatment: treatment.visualTreatment,
                overlayText: waypoint.title ? toUpper(waypoint.title) : undefined,
                sponsorId: waypoint.sponsor_id ?? null,
            };
        });
        const cameraEnergy = moments.length >= 3 ? "dynamic" : profile.pacing.cameraEnergy;
        return {
            sceneId: `day-${segment.day ?? globalIndex + 1}-scene-${index + 1}`,
            day: segment.day ?? globalIndex + 1,
            title: toUpper(segment.title) || `DAY ${segment.day ?? globalIndex + 1}`,
            sourceSegmentIndex: segment.segment_index ?? globalIndex,
            startSec,
            endSec,
            routeSlice: { fromProgress, toProgress },
            pacing: {
                speed: profile.pacing.speed,
                cameraEnergy,
            },
            text: {
                eyebrow: `DAY ${segment.day ?? globalIndex + 1}`,
                headline: toUpper(segment.title) || "",
            },
            moments,
        };
    });
}
function buildClosingCta(tour, profile, totalSec, ctaSec) {
    const stylePreset = mapGradeToStylePreset(profile.visualStyle.gradePreset);
    const textPrimary = toUpper(tour.sales_triggers?.cta_text) || "ACTIVATE TOUR";
    const textSecondary = toUpper(tour.route_label) ||
        (tour.origin && tour.destination ? `${tour.origin} → ${tour.destination}` : undefined);
    return {
        textPrimary,
        textSecondary,
        urgencyText: tour.sales_triggers?.urgency_text ? toUpper(tour.sales_triggers.urgency_text) : undefined,
        priceAnchorText: tour.sales_triggers?.price_anchor_text ? toUpper(tour.sales_triggers.price_anchor_text) : undefined,
        startSec: Number((totalSec - ctaSec).toFixed(2)),
        endSec: totalSec,
        stylePreset,
    };
}
function collectOverlayBlocks(hook, acts, cta) {
    const overlays = [
        {
            id: "opening-hook",
            text: hook.textPrimary,
            startSec: hook.startSec,
            endSec: hook.endSec,
            stylePreset: hook.stylePreset,
        },
        {
            id: "closing-cta",
            text: cta.textPrimary,
            startSec: cta.startSec,
            endSec: cta.endSec,
            stylePreset: cta.stylePreset,
        },
    ];
    for (const act of acts) {
        for (const scene of act.scenes) {
            for (const moment of scene.moments) {
                if (!moment.overlayText)
                    continue;
                overlays.push({
                    id: `moment-${moment.waypointSlug}`,
                    text: moment.overlayText,
                    startSec: scene.startSec,
                    endSec: Math.min(scene.endSec, scene.startSec + 1.5),
                    stylePreset: "tactical",
                });
            }
        }
    }
    return overlays;
}
export function buildNarrativePlan(tour, options = {}) {
    const formatIntent = options.formatIntent ?? "hero";
    const profile = resolveArchetypeProfile(tour.target_archetypes?.primary);
    const phases = normalizePhases(tour.campaign_phases);
    const runtime = allocateRuntime(formatIntent, phases.length);
    const openingHook = buildOpeningHook(tour, profile, runtime.hookSec);
    const closingCta = buildClosingCta(tour, profile, runtime.totalSec, runtime.ctaSec);
    const actCount = runtime.actDurations.length;
    const phaseGroups = groupPhases(phases, actCount);
    const segments = normalizeSegments(tour);
    const segmentBuckets = assignSegmentsToActs(segments, actCount);
    const totalSegments = segments.length;
    const acts = [];
    let cursor = openingHook.endSec;
    let globalOffset = 0;
    for (let i = 0; i < actCount; i++) {
        const actDuration = runtime.actDurations[i] ?? 0;
        const startSec = Number(cursor.toFixed(2));
        const endSec = Number((cursor + actDuration).toFixed(2));
        const phasesForAct = phaseGroups[i] ?? [{ phaseId: i + 1, title: `ACT ${i + 1}`, region: "" }];
        const primaryPhase = phasesForAct[0];
        const scenes = buildScenesForAct(segmentBuckets[i] ?? [], startSec, endSec, profile, globalOffset, totalSegments);
        globalOffset += segmentBuckets[i]?.length ?? 0;
        acts.push({
            actId: `act-${i + 1}`,
            sourcePhaseId: primaryPhase.phaseId,
            title: primaryPhase.title,
            region: primaryPhase.region,
            narrativeRole: resolveNarrativeRole(i, actCount),
            startSec,
            endSec,
            scenes,
        });
        cursor = endSec;
    }
    const monetizationMoments = buildMonetizationMoments(tour.monetization, {
        windowStart: Math.max(openingHook.endSec, closingCta.startSec - 3.5),
        windowEnd: closingCta.startSec,
        slotSec: 1.5,
    });
    const overlays = collectOverlayBlocks(openingHook, acts, closingCta);
    return {
        narrativeId: `${tour.tour_id}-${formatIntent}-${profile.key}`,
        sourceTourId: tour.tour_id,
        runtimeSec: runtime.totalSec,
        formatIntent,
        tone: profile.tone,
        archetype: tour.target_archetypes?.primary ?? "",
        openingHook,
        acts,
        closingCta,
        overlays,
        audioCues: [],
        visualStyle: profile.visualStyle,
        monetizationMoments,
    };
}
export function narrativePlanToVariantConfig(plan) {
    const urgency = plan.closingCta.urgencyText ? ` · ${plan.closingCta.urgencyText}` : "";
    const priceAnchor = plan.closingCta.priceAnchorText ? ` · ${plan.closingCta.priceAnchorText}` : "";
    const secondary = plan.closingCta.textSecondary ? ` · ${plan.closingCta.textSecondary}` : "";
    const ctaText = `${plan.closingCta.textPrimary}${secondary}${urgency}${priceAnchor}`;
    return {
        hookText: plan.openingHook.textPrimary,
        ctaText,
        gradePreset: plan.visualStyle.gradePreset,
    };
}
