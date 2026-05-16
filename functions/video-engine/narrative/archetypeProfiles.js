const PROFILES = [
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
function normalizeArchetype(archetype) {
    return String(archetype || "").trim().toLowerCase();
}
export function resolveArchetypeProfile(archetype) {
    const normalized = normalizeArchetype(archetype);
    if (!normalized)
        return PROFILES[3];
    if (normalized.includes("apex"))
        return PROFILES[0];
    if (normalized.includes("predator"))
        return PROFILES[0];
    if (normalized.includes("adventure"))
        return PROFILES[1];
    if (normalized.includes("luxury"))
        return PROFILES[2];
    if (normalized.includes("tour"))
        return PROFILES[3];
    return PROFILES[3];
}
