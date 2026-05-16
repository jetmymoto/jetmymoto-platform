/**
 * storageManifest.test.ts
 *
 * Tests for manifest construction, shape validation, and completion marker validation.
 * These are the "fail-fast" guards that block Step 2 from running on bad data.
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

import {
  buildManifest,
  buildCompleteMarker,
  validateManifestShape,
  validateCompleteMarker,
  validateManifestAgainstLocalDir,
  getFrameStoragePaths,
  getVideoStoragePaths,
  type FrameManifest,
  type CompleteMarker,
} from "../utils/storageManifest.js";

// ── buildManifest ─────────────────────────────────────────────────────────

describe("buildManifest", () => {
  it("contains the correct totalFrames", () => {
    const m = buildManifest(720);
    assert.equal(m.totalFrames, 720);
  });

  it("files array has exactly totalFrames entries", () => {
    const m = buildManifest(720);
    assert.equal(m.files.length, 720);
  });

  it("first file is frame_0000.png", () => {
    const m = buildManifest(720);
    assert.equal(m.files[0], "frame_0000.png");
  });

  it("last file is frame_0719.png", () => {
    const m = buildManifest(720);
    assert.equal(m.files[719], "frame_0719.png");
  });

  it("all filenames match frame_NNNN.png pattern", () => {
    const m = buildManifest(10);
    for (const f of m.files) {
      assert.match(f, /^frame_\d{4}\.png$/);
    }
  });
});

// ── buildCompleteMarker ───────────────────────────────────────────────────

describe("buildCompleteMarker", () => {
  it("status is 'complete'", () => {
    const c = buildCompleteMarker(720);
    assert.equal(c.status, "complete");
  });

  it("frameCount matches input", () => {
    const c = buildCompleteMarker(720);
    assert.equal(c.frameCount, 720);
  });

  it("completedAt is a valid ISO date", () => {
    const c = buildCompleteMarker(720);
    assert.ok(!isNaN(Date.parse(c.completedAt)));
  });
});

// ── validateManifestShape ─────────────────────────────────────────────────

describe("validateManifestShape", () => {
  it("passes a correctly built manifest", () => {
    const m = buildManifest(720);
    const result = validateManifestShape(m, 720);
    assert.ok(result.valid);
  });

  it("fails when totalFrames mismatches expected", () => {
    const m: FrameManifest = { totalFrames: 100, files: Array(100).fill("x.png") };
    const result = validateManifestShape(m, 720);
    assert.ok(!result.valid);
    assert.match(result.reason!, /totalFrames/);
  });

  it("fails when files array length mismatches totalFrames", () => {
    const m: FrameManifest = { totalFrames: 720, files: Array(5).fill("x.png") };
    const result = validateManifestShape(m, 720);
    assert.ok(!result.valid);
    assert.match(result.reason!, /files array length/);
  });
});

// ── validateCompleteMarker ────────────────────────────────────────────────

describe("validateCompleteMarker", () => {
  it("passes a valid complete marker", () => {
    const c = buildCompleteMarker(720);
    const result = validateCompleteMarker(c, 720);
    assert.ok(result.valid);
  });

  it("fails when status is not 'complete'", () => {
    const c: CompleteMarker = { status: "complete", frameCount: 720, completedAt: new Date().toISOString() };
    // Tamper with status
    const tampered = { ...c, status: "pending" as "complete" };
    const result = validateCompleteMarker(tampered, 720);
    assert.ok(!result.valid);
    assert.match(result.reason!, /status/);
  });

  it("fails when frameCount is wrong", () => {
    const c = buildCompleteMarker(100);
    const result = validateCompleteMarker(c, 720);
    assert.ok(!result.valid);
    assert.match(result.reason!, /frameCount/);
  });
});

// ── validateManifestAgainstLocalDir ──────────────────────────────────────

describe("validateManifestAgainstLocalDir", () => {
  let tmpDir: string;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "jmm-frames-"));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("passes when all manifest files are present", () => {
    const manifest = buildManifest(5);
    for (const filename of manifest.files) {
      fs.writeFileSync(path.join(tmpDir, filename), "");
    }
    const result = validateManifestAgainstLocalDir(manifest, tmpDir);
    assert.ok(result.valid);
  });

  it("fails when a frame file is missing", () => {
    const manifest = buildManifest(5);
    // Only write 4 of the 5 files
    for (const filename of manifest.files.slice(0, 4)) {
      fs.writeFileSync(path.join(tmpDir, filename), "");
    }
    // Remove the last one if it exists
    const lastFile = path.join(tmpDir, manifest.files[4]);
    if (fs.existsSync(lastFile)) fs.unlinkSync(lastFile);

    const result = validateManifestAgainstLocalDir(manifest, tmpDir);
    assert.ok(!result.valid);
    assert.match(result.reason!, /missing/);
  });

  it("fails when the directory does not exist", () => {
    const manifest = buildManifest(3);
    const result = validateManifestAgainstLocalDir(manifest, "/nonexistent/path/xyz");
    assert.ok(!result.valid);
    assert.match(result.reason!, /does not exist/);
  });
});

// ── Storage path helpers ──────────────────────────────────────────────────

describe("getFrameStoragePaths", () => {
  it("framesDir has correct prefix", () => {
    const p = getFrameStoragePaths("ath-to-muc");
    assert.ok(p.framesDir.startsWith("mapboxrawframes/ath-to-muc/"));
  });

  it("completeFile path is correct", () => {
    const p = getFrameStoragePaths("ath-to-muc");
    assert.equal(p.completeFile, "mapboxrawframes/ath-to-muc/complete.json");
  });

  it("frameFile(0) returns 4-digit zero-padded name", () => {
    const p = getFrameStoragePaths("ath-to-muc");
    assert.ok(p.frameFile(0).endsWith("frame_0000.png"));
  });

  it("frameFile(719) returns correct name", () => {
    const p = getFrameStoragePaths("ath-to-muc");
    assert.ok(p.frameFile(719).endsWith("frame_0719.png"));
  });
});

describe("getVideoStoragePaths", () => {
  it("landscape path ends in {slug}.mp4", () => {
    const p = getVideoStoragePaths("ath-to-muc");
    assert.ok(p.landscapeVideo.endsWith("ath-to-muc.mp4"));
  });

  it("portrait path ends in _9x16.mp4", () => {
    const p = getVideoStoragePaths("ath-to-muc");
    assert.ok(p.portraitVideo.endsWith("_9x16.mp4"));
  });

  it("square path ends in _1x1.mp4", () => {
    const p = getVideoStoragePaths("ath-to-muc");
    assert.ok(p.squareVideo.endsWith("_1x1.mp4"));
  });
});
