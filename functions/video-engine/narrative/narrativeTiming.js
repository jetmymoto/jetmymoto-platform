function resolveTotals(format) {
    switch (format) {
        case "ad":
            return { totalSec: 15, hookSec: 1.8, ctaSec: 2.5 };
        case "reel":
            return { totalSec: 20, hookSec: 2.0, ctaSec: 3.0 };
        case "tour_trailer":
            return { totalSec: 45, hookSec: 3.5, ctaSec: 5.0 };
        case "hero":
        default:
            return { totalSec: 24, hookSec: 2.5, ctaSec: 3.5 };
    }
}
function weightsForActs(actCount) {
    if (actCount <= 1)
        return [1];
    if (actCount === 2)
        return [0.45, 0.55];
    return [0.30, 0.40, 0.30];
}
export function allocateRuntime(format, phaseCount) {
    const { totalSec, hookSec, ctaSec } = resolveTotals(format);
    const actCount = Math.max(1, Math.min(phaseCount || 1, 3));
    const remaining = Math.max(0, totalSec - hookSec - ctaSec);
    const weights = weightsForActs(actCount);
    const actDurations = weights.map((w) => Number((remaining * w).toFixed(2)));
    return { totalSec, hookSec, ctaSec, actDurations };
}
