export function buildMonetizationMoments(items, placement) {
    if (!items || items.length === 0)
        return [];
    const slotSec = placement.slotSec ?? 1.5;
    const available = Math.max(0, placement.windowEnd - placement.windowStart);
    if (available <= 0)
        return [];
    const maxSlots = Math.max(1, Math.floor(available / slotSec));
    const selected = items.slice(0, maxSlots);
    return selected.map((item, index) => {
        const startSec = placement.windowStart + index * slotSec;
        const endSec = Math.min(placement.windowEnd, startSec + slotSec);
        return {
            type: item.type,
            startSec,
            endSec,
            payload: {
                partnerId: item.partnerId,
                displayText: item.displayText,
                cpaValueEur: item.cpaValueEur,
            },
        };
    });
}
