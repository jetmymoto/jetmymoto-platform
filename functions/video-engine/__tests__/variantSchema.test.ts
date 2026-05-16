/**
 * variantSchema.test.ts
 *
 * Tests for variant config parsing, defaults, and preset resolution.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  resolveVariantConfig,
  parseVariantArg,
  GRADE_FILTERS,
  LAYOUT_PRESETS,
  type VideoVariantConfig,
} from "../utils/variantSchema.js";

// ── resolveVariantConfig ──────────────────────────────────────────────────

describe("resolveVariantConfig", () => {
  it("applies all defaults when called with empty object", () => {
    const config = resolveVariantConfig({});
    assert.equal(config.gradePreset, "hero_amber");
    assert.equal(config.ctaText, "LIMITED REPOSITION SLOTS");
    assert.equal(config.watermarkText, "JETMYMOTO");
    assert.deepEqual(config.outputAspects, ["16:9", "9:16", "1:1"]);
    assert.equal(config.logoPath, null);
    assert.equal(config.musicBedPath, null);
  });

  it("applies all defaults when called with no argument", () => {
    const config = resolveVariantConfig();
    assert.ok(config.outputAspects.includes("16:9"));
  });

  it("preserves provided hookText", () => {
    const config = resolveVariantConfig({ hookText: "SAVE €291" });
    assert.equal(config.hookText, "SAVE €291");
  });

  it("preserves provided gradePreset", () => {
    const config = resolveVariantConfig({ gradePreset: "cinematic_cool" });
    assert.equal(config.gradePreset, "cinematic_cool");
  });

  it("preserves partial outputAspects override", () => {
    const config = resolveVariantConfig({ outputAspects: ["16:9"] });
    assert.deepEqual(config.outputAspects, ["16:9"]);
  });
});

// ── parseVariantArg ───────────────────────────────────────────────────────

describe("parseVariantArg", () => {
  it("resolves 'default' preset to empty config", async () => {
    const config = await parseVariantArg("default");
    assert.deepEqual(config, {});
  });

  it("resolves 'cinematic' preset with grade=cinematic_cool", async () => {
    const config = await parseVariantArg("cinematic");
    assert.equal(config.gradePreset, "cinematic_cool");
  });

  it("resolves 'bright' preset with grade=clean_bright", async () => {
    const config = await parseVariantArg("bright");
    assert.equal(config.gradePreset, "clean_bright");
  });

  it("throws for unknown preset name that is not a file path", async () => {
    await assert.rejects(
      () => parseVariantArg("nonexistent_preset_xyz"),
      /neither a known preset nor a valid JSON file/,
    );
  });
});

// ── GRADE_FILTERS ─────────────────────────────────────────────────────────

describe("GRADE_FILTERS", () => {
  it("all three presets exist", () => {
    assert.ok(GRADE_FILTERS["hero_amber"]);
    assert.ok(GRADE_FILTERS["cinematic_cool"]);
    assert.ok(GRADE_FILTERS["clean_bright"]);
  });

  it("each grade filter string contains 'curves' or 'eq'", () => {
    for (const [preset, filter] of Object.entries(GRADE_FILTERS)) {
      const hasCurves = filter.includes("curves");
      const hasEq = filter.includes("eq");
      assert.ok(
        hasCurves || hasEq,
        `Grade preset '${preset}' filter should contain curves or eq`,
      );
    }
  });
});

// ── LAYOUT_PRESETS ────────────────────────────────────────────────────────

describe("LAYOUT_PRESETS", () => {
  it("16:9 preset has 1280×720 dimensions", () => {
    assert.equal(LAYOUT_PRESETS["16:9"].width, 1280);
    assert.equal(LAYOUT_PRESETS["16:9"].height, 720);
  });

  it("9:16 preset has portrait dimensions (height > width)", () => {
    assert.ok(
      LAYOUT_PRESETS["9:16"].height > LAYOUT_PRESETS["9:16"].width,
      "9:16 should be portrait",
    );
  });

  it("1:1 preset has equal width and height", () => {
    assert.equal(LAYOUT_PRESETS["1:1"].width, LAYOUT_PRESETS["1:1"].height);
  });

  it("all presets have a cropFilter property", () => {
    for (const [aspect, preset] of Object.entries(LAYOUT_PRESETS)) {
      assert.ok(
        typeof preset.cropFilter === "string" && preset.cropFilter.length > 0,
        `Preset '${aspect}' missing cropFilter`,
      );
    }
  });

  it("all presets have positive fontScale", () => {
    for (const [aspect, preset] of Object.entries(LAYOUT_PRESETS)) {
      assert.ok(preset.fontScale > 0, `Preset '${aspect}' fontScale must be positive`);
    }
  });
});
