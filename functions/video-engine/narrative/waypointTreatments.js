const TREATMENTS = {
    scenic_pass: { emphasis: "medium", visualTreatment: "label_overlay" },
    technical_climb: { emphasis: "high", visualTreatment: "speed_ramp" },
    fuel_stop: { emphasis: "low", visualTreatment: "label_overlay" },
    hotel_arrival: { emphasis: "medium", visualTreatment: "micro_pause" },
    sponsor_marker: { emphasis: "high", visualTreatment: "label_overlay" },
    border_crossing: { emphasis: "medium", visualTreatment: "micro_pause" },
    viewpoint: { emphasis: "medium", visualTreatment: "glow_pulse" },
    unknown: { emphasis: "low", visualTreatment: "label_overlay" },
};
function normalizeWaypointType(type) {
    const normalized = String(type || "").trim().toLowerCase();
    if (!normalized)
        return "unknown";
    if (normalized.includes("scenic"))
        return "scenic_pass";
    if (normalized.includes("technical") || normalized.includes("climb"))
        return "technical_climb";
    if (normalized.includes("fuel"))
        return "fuel_stop";
    if (normalized.includes("hotel"))
        return "hotel_arrival";
    if (normalized.includes("sponsor"))
        return "sponsor_marker";
    if (normalized.includes("border"))
        return "border_crossing";
    if (normalized.includes("view"))
        return "viewpoint";
    return "unknown";
}
export function resolveWaypointTreatment(type) {
    const normalized = normalizeWaypointType(type);
    return TREATMENTS[normalized] ?? TREATMENTS.unknown;
}
