/**
 * Shared model target matcher for regex-based motorcycle identification.
 * Accepts a single combined signal string so upstream callers can decide
 * which signals are worth including.
 */

/**
 * Build flat model match entries with precompiled regex patterns.
 *
 * @param {Object<string, string[]>} modelTargetsObj
 * @returns {Array<{brand: string, model: string, patterns: RegExp[]}>}
 */
export function buildFlatModelTargets(modelTargetsObj = {}) {
  const flatModelNames = [];

  for (const [brand, models] of Object.entries(modelTargetsObj)) {
    for (const model of models) {
      const baseTerm = String(model || "").toLowerCase();
      if (!baseTerm) continue;

      const compact = baseTerm.replace(/\s+/g, "");
      const spaced = baseTerm;
      const patterns = [...new Set([compact, spaced, `${brand.toLowerCase()} ${spaced}`])]
        .map((term) => {
          const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          return new RegExp(`(?:^|[\\s,./\\-_(])${escaped}(?:[\\s,./\\-_)]|$)`, "i");
        });

      flatModelNames.push({ brand, model, patterns });
    }
  }

  return flatModelNames;
}

/**
 * Match a combined signal string against precompiled model targets.
 *
 * @param {string} signal
 * @param {Array<{brand: string, model: string, patterns: RegExp[]}>} flatModelNames
 * @returns {{brand: string, model: string}|null}
 */
export function matchModelTarget(signal, flatModelNames = []) {
  if (!signal || typeof signal !== "string" || flatModelNames.length === 0) {
    return null;
  }

  const haystack = signal.toLowerCase();
  if (!haystack.trim()) return null;

  for (const entry of flatModelNames) {
    for (const pattern of entry.patterns) {
      if (pattern.test(haystack)) {
        return { brand: entry.brand, model: entry.model };
      }
    }
  }

  return null;
}
