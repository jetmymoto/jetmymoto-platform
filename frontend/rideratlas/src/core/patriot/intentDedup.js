// Semantic deduplication with priority hierarchy (🔴3).
// Priority: bike-specific > category > price > generic
// When two keywords share the same semantic root at the same airport,
// the higher-priority intent type wins. Ties broken by keyword length (longer = more specific).

import { normalizeKeywordRoot, classifyIntentType } from "./keywordUtils.js";

const INTENT_PRIORITY = {
  "bike-specific": 4,
  "category": 3,
  "price": 2,
  "generic": 1,
};

// Deduplicate intent signals per airport by semantic root.
// Returns filtered array of intents that survived dedup.
export function deduplicateIntents(intents) {
  // Group by airport + semantic root
  const groups = new Map();

  for (const intent of intents) {
    const code = String(intent.airportCode || "").toUpperCase();
    const root = normalizeKeywordRoot(intent.keyword);
    const groupKey = `${code}::${root}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(intent);
  }

  // For each group, pick the winner
  const winners = [];

  for (const [, group] of groups) {
    const sorted = group.sort((a, b) => {
      const priorityA = INTENT_PRIORITY[classifyIntentType(a.keyword)] || 0;
      const priorityB = INTENT_PRIORITY[classifyIntentType(b.keyword)] || 0;

      // Higher priority wins
      if (priorityB !== priorityA) return priorityB - priorityA;

      // Tie: longer keyword is more specific
      return (b.keyword || "").length - (a.keyword || "").length;
    });

    winners.push(sorted[0]);
  }

  return winners;
}
