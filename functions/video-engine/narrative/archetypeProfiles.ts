export type HookType = "savings" | "experience" | "destination" | "urgency";
export type Tone = "cinematic" | "aggressive" | "luxury" | "adventure";

export type PacingProfile = {
  speed: "slow" | "medium" | "fast";
  cameraEnergy: "smooth" | "dynamic" | "aggressive";
  sceneDurationBias: number; // <1 = shorter scenes, >1 = longer scenes
};

export type VisualStyle = {
  gradePreset: "hero_amber" | "clean_bright" | "cinematic_cool";
  mapBrightnessBias: "low" | "neutral" | "high";
  grain: "off" | "light" | "medium";
  bloom: "off" | "light" | "medium";
  vignette: "off" | "light" | "medium";
  textStyle: "minimal" | "tactical" | "luxury";
};

export type ArchetypeProfile = {
  key: string;
  tone: Tone;
  hookType: HookType;
  pacing: PacingProfile;
  visualStyle: VisualStyle;
};

const PROFILES: ArchetypeProfile[] = [
  {
    key: "apex_predator",
    tone: "aggressive",
    hookType: "urgency",
    pacing: { speed: "fast", cameraEnergy: "aggressive", sceneDurationBias: 0.85 },
    visualStyle: {
      gradePreset: "hero_amber",
      mapBrightnessBias: "low",
      grain: "medium",
      bloom: "light",
      vignette: "medium",
      textStyle: "tactical",
    },
  },
  {
    key: "adventure_king",
    tone: "adventure",
    hookType: "experience",
    pacing: { speed: "medium", cameraEnergy: "dynamic", sceneDurationBias: 1.05 },
    visualStyle: {
      gradePreset: "cinematic_cool",
      mapBrightnessBias: "neutral",
      grain: "light",
      bloom: "light",
      vignette: "light",
      textStyle: "minimal",
    },
  },
  {
    key: "luxury",
    tone: "luxury",
    hookType: "destination",
    pacing: { speed: "slow", cameraEnergy: "smooth", sceneDurationBias: 1.2 },
    visualStyle: {
      gradePreset: "clean_bright",
      mapBrightnessBias: "high",
      grain: "off",
      bloom: "light",
      vignette: "light",
      textStyle: "luxury",
    },
  },
  {
    key: "touring",
    tone: "cinematic",
    hookType: "experience",
    pacing: { speed: "medium", cameraEnergy: "smooth", sceneDurationBias: 1.1 },
    visualStyle: {
      gradePreset: "hero_amber",
      mapBrightnessBias: "neutral",
      grain: "light",
      bloom: "off",
      vignette: "light",
      textStyle: "minimal",
    },
  },
];

function normalizeArchetype(archetype?: string): string {
  return String(archetype || "").trim().toLowerCase();
}

export function resolveArchetypeProfile(archetype?: string): ArchetypeProfile {
  const normalized = normalizeArchetype(archetype);
  if (!normalized) return PROFILES[3];

  if (normalized.includes("apex")) return PROFILES[0];
  if (normalized.includes("predator")) return PROFILES[0];
  if (normalized.includes("adventure")) return PROFILES[1];
  if (normalized.includes("luxury")) return PROFILES[2];
  if (normalized.includes("tour")) return PROFILES[3];

  return PROFILES[3];
}
