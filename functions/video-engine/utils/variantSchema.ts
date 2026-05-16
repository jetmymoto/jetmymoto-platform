/**
 * variantSchema.ts
 *
 * Step 2 input contract — typed variant configuration for video composition.
 * Defines grading presets, layout presets, and the VideoVariantConfig object.
 */

// ── Grading presets ───────────────────────────────────────────────────────

export type GradePreset =
  | "hero_amber"
  | "cinematic_cool"
  | "clean_bright"
  | "balanced_bright"
  | "tactical_amber_bright"
  | "readable_bright";

/**
 * FFmpeg color-grade filter strings per preset.
 * Appended to the base curves/eq chain in the filtergraph.
 *
 * Bright variants (balanced_bright, tactical_amber_bright, readable_bright):
 *   These lift exposure, raise midtones, and add mild saturation without
 *   crushing blacks or oversaturating greens. They are designed for the
 *   existing stored Mapbox dark-v11 frames and should be tried before
 *   considering brighter source map imagery.
 *
 *   Bloom chain shared by all bright variants:
 *     split[a][b]; [b]gblur=sigma=8[blur]; [a][blur]blend=screen:opacity=0.10
 *   This adds a subtle glow layer that lifts perceived brightness without
 *   clipping highlights.
 */
export const GRADE_FILTERS: Record<GradePreset, string> = {
  hero_amber:
    "curves=all='0/0.05 0.5/0.5 1/0.95'," +
    "eq=contrast=1.12:saturation=1.15:gamma=0.95",
  cinematic_cool:
    "curves=all='0/0.04 0.5/0.48 1/0.94'," +
    "colorbalance=rs=-0.05:gs=-0.02:bs=0.10:rh=-0.05:gh=0.0:bh=0.10," +
    "eq=contrast=1.10:saturation=0.95:gamma=1.0",
  clean_bright:
    "curves=all='0/0.0 0.5/0.52 1/1.0'," +
    "eq=contrast=1.05:saturation=1.0:gamma=1.05",

  // ── Bright test grades — Step 2 FFmpeg-only brightness recovery ───────

  /**
   * Variant A — balanced bright
   * Slight exposure lift + gentle gamma raise + mild saturation.
   * Best general-purpose starting point. Keeps a cinematic tone.
   * bloom glow + vignette + grain + mild sharpen applied.
   */
  balanced_bright:
    "eq=brightness=0.04:contrast=1.08:saturation=1.12:gamma=1.06," +
    "unsharp=5:5:0.6:3:3:0.2," +
    "vignette=PI/6," +
    "noise=alls=4:allf=t",

  /**
   * Variant B — tactical amber bright
   * Balanced bright plus a subtle warm colour bias (red/yellow push).
   * Gives terrain a "golden hour" feel on alpine maps.
   * bloom glow + vignette + grain included.
   */
  tactical_amber_bright:
    "eq=brightness=0.05:contrast=1.06:saturation=1.10:gamma=1.08," +
    "colorbalance=rs=0.015:gs=0.005:bs=-0.01," +
    "unsharp=5:5:0.6:3:3:0.2," +
    "vignette=PI/6," +
    "noise=alls=4:allf=t",

  /**
   * Variant C — readable bright
   * Strongest midtone lift of the three. Minimal stylisation.
   * Optimised for maximum route clarity and text legibility.
   * bloom glow + gentle vignette + fine grain.
   */
  readable_bright:
    "eq=brightness=0.06:contrast=1.04:saturation=1.08:gamma=1.10," +
    "unsharp=5:5:0.6:3:3:0.2," +
    "vignette=PI/5," +
    "noise=alls=4:allf=t",
};

/**
 * Returns true if the grade preset is one of the bright test variants.
 * Used by the filtergraph builder to inject the bloom split chain.
 */
export function isBrightGrade(grade: GradePreset): boolean {
  return (
    grade === "balanced_bright" ||
    grade === "tactical_amber_bright" ||
    grade === "readable_bright"
  );
}

// ── Layout presets ────────────────────────────────────────────────────────

export type AspectRatio = "16:9" | "9:16" | "1:1";

export type LayoutPreset = {
  width: number;
  height: number;
  cropFilter: string;         // FFmpeg crop/scale expression applied to source 16:9 1280×720
  titleY: number;             // Y coordinate for main title overlay
  subtitleY: number;
  ctaY: number;
  watermarkX: string;         // FFmpeg expression (e.g. "w-tw-40")
  watermarkY: string;
  hudBoxY: number;            // Y for KM/time HUD
  fontScale: number;          // Multiplier for all font sizes
};

export const LAYOUT_PRESETS: Record<AspectRatio, LayoutPreset> = {
  "16:9": {
    width: 1280,
    height: 720,
    cropFilter: "scale=1280:720",
    titleY: 80,
    subtitleY: 140,
    ctaY: 200,
    watermarkX: "w-tw-40",
    watermarkY: "h-th-40",
    hudBoxY: 580, // h - 140
    fontScale: 1.0,
  },
  "9:16": {
    width: 720,
    height: 1280,
    cropFilter: "crop=ih*9/16:ih,scale=720:1280",
    titleY: 160,
    subtitleY: 240,
    ctaY: 320,
    watermarkX: "w-tw-30",
    watermarkY: "h-th-60",
    hudBoxY: 1100,
    fontScale: 1.2,
  },
  "1:1": {
    width: 720,
    height: 720,
    cropFilter: "crop=ih:ih,scale=720:720",
    titleY: 80,
    subtitleY: 140,
    ctaY: 200,
    watermarkX: "w-tw-30",
    watermarkY: "h-th-30",
    hudBoxY: 580,
    fontScale: 0.9,
  },
};

// ── Variant config ────────────────────────────────────────────────────────

export type VideoVariantConfig = {
  hookText?: string;
  ctaText?: string;
  gradePreset?: GradePreset;
  logoPath?: string | null;
  watermarkText?: string;
  outputAspects?: AspectRatio[];
  interpolationMode?: "heavy" | "light" | "off";
  musicBedPath?: string | null;
  ambientLoopPath?: string | null;
  sfxArrivalPath?: string | null;
};

/**
 * Returns a config with all optional fields filled in using safe defaults.
 */
export function resolveVariantConfig(
  input: VideoVariantConfig = {},
): Required<VideoVariantConfig> {
  return {
    hookText: input.hookText ?? "",
    ctaText: input.ctaText ?? "LIMITED REPOSITION SLOTS",
    gradePreset: input.gradePreset ?? "hero_amber",
    logoPath: input.logoPath ?? null,
    watermarkText: input.watermarkText ?? "JETMYMOTO",
    outputAspects: input.outputAspects ?? ["16:9", "9:16", "1:1"],
    interpolationMode: input.interpolationMode ?? "heavy",
    musicBedPath: input.musicBedPath ?? null,
    ambientLoopPath: input.ambientLoopPath ?? null,
    sfxArrivalPath: input.sfxArrivalPath ?? null,
  };
}

/**
 * Combinatorial inline variant shape accepted by parseVariantArg.
 * Allows A/B engine to pass structured overrides without preset names.
 *
 * Example:
 *   --variant='{"hook":"SAVE €291","cta":"ACTIVATE","grade":"hero_amber"}'
 */
export type CombinatorialVariant = {
  hook?: string;
  cta?: string;
  grade?: GradePreset;
  aspects?: AspectRatio[];
  interpolate?: "heavy" | "light" | "off";
};

function isCombinatorialVariant(obj: unknown): obj is CombinatorialVariant {
  if (typeof obj !== "object" || obj === null) return false;
  const keys = Object.keys(obj);
  return keys.some((k) => ["hook", "cta", "grade", "aspects"].includes(k));
}

function combinatorialToVariantConfig(c: CombinatorialVariant): VideoVariantConfig {
  return {
    hookText: c.hook,
    ctaText: c.cta,
    gradePreset: c.grade,
    outputAspects: c.aspects,
    interpolationMode: c.interpolate,
  };
}

/**
 * Parse a variant config from:
 *   1. Named preset  (e.g. "cinematic")
 *   2. Inline JSON combinatorial object  (e.g. '{"hook":"SAVE €291","cta":"ACTIVATE","grade":"hero_amber"}')
 *   3. JSON file path  (e.g. "./variants/custom.json")
 *
 * Used by the CLI `--variant=<preset|json|path>` flag.
 */
export async function parseVariantArg(
  variantArg: string,
): Promise<VideoVariantConfig> {
  // 1. Named preset shortcuts
  const PRESETS: Record<string, VideoVariantConfig> = {
    default: {},
    cinematic: { gradePreset: "cinematic_cool", watermarkText: "JETMYMOTO" },
    bright: { gradePreset: "clean_bright" },
    hero: { gradePreset: "hero_amber" },
    debug_fast: { outputAspects: ["16:9"], interpolationMode: "light" },
    debug_no_interp: { outputAspects: ["16:9"], interpolationMode: "off" },
    // Bright test grade presets
    balanced_bright: { gradePreset: "balanced_bright", hookText: "ALPINE TRAVERSE", ctaText: "" },
    tactical_amber_bright: { gradePreset: "tactical_amber_bright", hookText: "ALPINE TRAVERSE", ctaText: "" },
    readable_bright: { gradePreset: "readable_bright", hookText: "ALPINE TRAVERSE", ctaText: "" },
  };

  if (PRESETS[variantArg] !== undefined) {
    return PRESETS[variantArg];
  }

  // 2. Inline JSON combinatorial object (starts with '{')
  if (variantArg.trimStart().startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(variantArg);
      if (isCombinatorialVariant(parsed)) {
        return combinatorialToVariantConfig(parsed);
      }
      // If it has VideoVariantConfig keys, use directly
      return parsed as VideoVariantConfig;
    } catch {
      throw new Error(`--variant JSON parse failed: ${variantArg}`);
    }
  }

  // 3. File path
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(variantArg, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (isCombinatorialVariant(parsed)) {
      return combinatorialToVariantConfig(parsed as CombinatorialVariant);
    }
    return parsed as VideoVariantConfig;
  } catch {
    throw new Error(
      `--variant="${variantArg}" is not a known preset, valid inline JSON, or readable JSON file`,
    );
  }
}
