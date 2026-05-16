import {
  resolveArchetypeProfile,
  type ArchetypeProfile,
  type HookType,
  type VisualStyle,
  type Tone,
} from "./archetypeProfiles.js";
import { allocateRuntime, type FormatIntent } from "./narrativeTiming.js";
import { resolveWaypointTreatment } from "./waypointTreatments.js";
import {
  buildMonetizationMoments,
  type MonetizationInput,
  type MonetizationMoment,
} from "./monetizationMapping.js";
import type { GradePreset, VideoVariantConfig } from "../utils/variantSchema.js";

export type HookBlock = {
  type: HookType;
  textPrimary: string;
  textSecondary?: string;
  startSec: number;
  endSec: number;
  stylePreset: "hero_amber" | "clean_bright" | "tactical";
};

export type ActBlock = {
  actId: string;
  sourcePhaseId: number;
  title: string;
  region: string;
  narrativeRole: "entry" | "build" | "peak" | "release" | "arrival";
  startSec: number;
  endSec: number;
  scenes: SceneBlock[];
};

export type SceneBlock = {
  sceneId: string;
  day: number;
  title: string;
  sourceSegmentIndex: number;
  startSec: number;
  endSec: number;
  routeSlice: {
    fromProgress: number;
    toProgress: number;
  };
  pacing: {
    speed: "slow" | "medium" | "fast";
    cameraEnergy: "smooth" | "dynamic" | "aggressive";
    lingerMs?: number;
  };
  text?: {
    eyebrow?: string;
    headline?: string;
    subline?: string;
  };
  moments: MomentBlock[];
};

export type MomentBlock = {
  waypointSlug: string;
  type:
    | "scenic_pass"
    | "technical_climb"
    | "fuel_stop"
    | "hotel_arrival"
    | "sponsor_marker"
    | "border_crossing"
    | "viewpoint"
    | "unknown";
  emphasis: "low" | "medium" | "high";
  visualTreatment:
    | "micro_pause"
    | "zoom_in"
    | "glow_pulse"
    | "label_overlay"
    | "speed_ramp";
  overlayText?: string;
  sponsorId?: string | null;
};

export type CtaBlock = {
  textPrimary: string;
  textSecondary?: string;
  urgencyText?: string;
  priceAnchorText?: string;
  startSec: number;
  endSec: number;
  stylePreset: "hero_amber" | "clean_bright" | "tactical";
};

export type OverlayBlock = {
  id: string;
  text: string;
  startSec: number;
  endSec: number;
  stylePreset: "hero_amber" | "clean_bright" | "tactical";
};

export type AudioCue = {
  id: string;
  type: "hit" | "whoosh" | "ambience";
  startSec: number;
  endSec?: number;
};

export type VideoNarrativePlan = {
  narrativeId: string;
  sourceTourId: string;
  runtimeSec: number;
  formatIntent: FormatIntent;
  tone: Tone;
  archetype: string;

  openingHook: HookBlock;
  acts: ActBlock[];
  closingCta: CtaBlock;

  overlays: OverlayBlock[];
  audioCues: AudioCue[];
  visualStyle: VisualStyle;
  monetizationMoments: MonetizationMoment[];
};

export type NarrativeBuildOptions = {
  formatIntent?: FormatIntent;
};

export type GrandTourSchema = {
  tour_id: string;
  title?: string;
  subtitle?: string;
  route_label?: string;
  origin?: string;
  destination?: string;
  duration_days?: number;
  distance_km?: number;
  target_archetypes?: { primary?: string };
  campaign_phases?: Array<{
    phase_id?: number;
    title?: string;
    region?: string;
  }>;
  daily_segments?: Array<{
    day?: number;
    title?: string;
    segment_index?: number;
    waypoints?: Array<{
      slug: string;
      type?: string;
      title?: string;
      sponsor_id?: string | null;
    }>;
  }>;
  waypoints?: Array<{
    slug: string;
    type?: string;
    title?: string;
    sponsor_id?: string | null;
  }>;
  sales_triggers?: {
    hook_type?: HookType;
    hook_text?: string;
    urgency_text?: string;
    price_anchor_text?: string;
    cta_text?: string;
  };
  monetization?: MonetizationInput[];
};

type DailySegment = NonNullable<GrandTourSchema["daily_segments"]>[number];

function toUpper(text?: string): string {
  return String(text || "").trim().toUpperCase();
}

function mapGradeToStylePreset(grade: GradePreset): "hero_amber" | "clean_bright" | "tactical" {
  if (grade === "clean_bright") return "clean_bright";
  if (grade === "cinematic_cool") return "tactical";
  return "hero_amber";
}

function resolveHookType(tour: GrandTourSchema, profile: ArchetypeProfile): HookType {
  if (tour.sales_triggers?.hook_type) return tour.sales_triggers.hook_type;
  if (tour.sales_triggers?.urgency_text) return "urgency";
  if (tour.sales_triggers?.price_anchor_text) return "savings";
  return profile.hookType;
}

function buildOpeningHook(
  tour: GrandTourSchema,
  profile: ArchetypeProfile,
  hookSec: number,
): HookBlock {
  const hookType = resolveHookType(tour, profile);
  const stylePreset = mapGradeToStylePreset(profile.visualStyle.gradePreset);
  const textPrimary =
    toUpper(tour.sales_triggers?.hook_text) ||
    toUpper(tour.title) ||
    "GRAND TOUR";

  let textSecondary: string | undefined;
  if (hookType === "urgency" && tour.sales_triggers?.urgency_text) {
    textSecondary = toUpper(tour.sales_triggers.urgency_text);
  } else if (tour.subtitle) {
    textSecondary = toUpper(tour.subtitle);
  } else if (tour.duration_days && tour.distance_km) {
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

function resolveNarrativeRole(index: number, total: number): ActBlock["narrativeRole"] {
  if (total <= 1) return "arrival";
  if (index === 0) return "entry";
  if (index === total - 1) return total === 2 ? "arrival" : "arrival";
  return total === 3 && index === 1 ? "peak" : "build";
}

type PhaseGroup = {
  phaseId: number;
  title: string;
  region: string;
};

function normalizePhases(phases: GrandTourSchema["campaign_phases"]): PhaseGroup[] {
  if (!phases || phases.length === 0) {
    return [{ phaseId: 1, title: "THE JOURNEY", region: "" }];
  }

  return phases.map((phase, idx) => ({
    phaseId: phase.phase_id ?? idx + 1,
    title: toUpper(phase.title) || `PHASE ${idx + 1}`,
    region: phase.region ?? "",
  }));
}

function groupPhases(phases: PhaseGroup[], actCount: number): PhaseGroup[][] {
  if (phases.length <= actCount) return phases.map((p) => [p]);
  if (actCount === 1) return [phases];
  if (actCount === 2) return [phases.slice(0, 1), phases.slice(1)];
  return [phases.slice(0, 1), phases.slice(1, -1), phases.slice(-1)];
}

function normalizeSegments(tour: GrandTourSchema): DailySegment[] {
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

function assignSegmentsToActs(segments: DailySegment[], actCount: number): Array<DailySegment[]> {
  if (actCount <= 1) return [segments];
  const total = segments.length;
  const base = Math.floor(total / actCount);
  const remainder = total % actCount;

  const buckets: Array<Array<GrandTourSchema["daily_segments"][number]>> = [];
  let cursor = 0;
  for (let i = 0; i < actCount; i++) {
    const size = base + (i < remainder ? 1 : 0);
    buckets.push(segments.slice(cursor, cursor + size));
    cursor += size;
  }
  return buckets.map((bucket, idx) => (bucket.length === 0 ? segments.slice(idx, idx + 1) : bucket));
}

function buildScenesForAct(
  segments: DailySegment[],
  actStart: number,
  actEnd: number,
  profile: ArchetypeProfile,
  globalOffset: number,
  totalSegments: number,
): SceneBlock[] {
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
      const allowedTypes: MomentBlock["type"][] = [
        "scenic_pass",
        "technical_climb",
        "fuel_stop",
        "hotel_arrival",
        "sponsor_marker",
        "border_crossing",
        "viewpoint",
        "unknown",
      ];
      const normalizedType = (allowedTypes.includes(rawType as MomentBlock["type"]) ? rawType : "unknown") as MomentBlock["type"];
      return {
        waypointSlug: waypoint.slug,
        type: normalizedType,
        emphasis: waypoint.sponsor_id ? "high" : treatment.emphasis,
        visualTreatment: treatment.visualTreatment,
        overlayText: waypoint.title ? toUpper(waypoint.title) : undefined,
        sponsorId: waypoint.sponsor_id ?? null,
      } satisfies MomentBlock;
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
    } satisfies SceneBlock;
  });
}

function buildClosingCta(
  tour: GrandTourSchema,
  profile: ArchetypeProfile,
  totalSec: number,
  ctaSec: number,
): CtaBlock {
  const stylePreset = mapGradeToStylePreset(profile.visualStyle.gradePreset);
  const textPrimary = toUpper(tour.sales_triggers?.cta_text) || "ACTIVATE TOUR";
  const textSecondary =
    toUpper(tour.route_label) ||
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

function collectOverlayBlocks(
  hook: HookBlock,
  acts: ActBlock[],
  cta: CtaBlock,
): OverlayBlock[] {
  const overlays: OverlayBlock[] = [
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
        if (!moment.overlayText) continue;
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

export function buildNarrativePlan(
  tour: GrandTourSchema,
  options: NarrativeBuildOptions = {},
): VideoNarrativePlan {
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

  const acts: ActBlock[] = [];
  let cursor = openingHook.endSec;
  let globalOffset = 0;

  for (let i = 0; i < actCount; i++) {
    const actDuration = runtime.actDurations[i] ?? 0;
    const startSec = Number(cursor.toFixed(2));
    const endSec = Number((cursor + actDuration).toFixed(2));
    const phasesForAct = phaseGroups[i] ?? [{ phaseId: i + 1, title: `ACT ${i + 1}`, region: "" }];
    const primaryPhase = phasesForAct[0];

    const scenes = buildScenesForAct(
      segmentBuckets[i] ?? [],
      startSec,
      endSec,
      profile,
      globalOffset,
      totalSegments,
    );

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

export function narrativePlanToVariantConfig(plan: VideoNarrativePlan): VideoVariantConfig {
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
