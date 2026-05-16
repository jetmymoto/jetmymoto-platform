/**
 * step1_mcpFrames.ts  — Option B: MCP-based frame acquisition
 *
 * Drop-in replacement for step1_downloadFrames.ts that sources both
 * the road-snapped route geometry and every rendered frame through the
 * Mapbox MCP server (JSON-RPC 2.0 stdio) rather than raw HTTP calls.
 *
 * Storage/output contract:
 *   - Same Firebase Storage layout  (mapboxrawframes/{slug}/...)
 *   - Same metadata.json / camera_state.json / manifest.json / complete.json
 *   - Same frame naming            (frame_0000.png … frame_0719.png)
 *   - Same Step1Result return type
 *
 * Changes vs HTTP option:
 *   - buildRouteGeo() is NOT used; road-snapped coords come from directions_tool
 *   - safeMapboxFetch() / buildFrameUrl() are NOT used; PNG images come from
 *     static_map_image_tool via MapboxMCPClient.renderFrame()
 *   - MAPBOX_TOKEN env var is NOT read here; the MCP server owns the token
 *   - Camera bearing/pitch parity is not available through the current
 *     Mapbox MCP static image tool, so rendered frames are north-up even
 *     though camera_state.json still records the planned camera path
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

import {
  buildFramePlan,
  buildOverlayCoords,
  encodePolyline,
} from "./utils/buildFramePlan.js";
import {
  getFrameStoragePaths,
  buildManifest,
  buildCompleteMarker,
  type FramesMetadata,
  type CameraStateEntry,
} from "./utils/storageManifest.js";
import { MapboxMCPClient } from "./utils/mapboxMCPClient.js";

// Re-export the same types so callers are interchangeable
export type {
  Step1Input,
  Step1Options,
  Step1Result,
  ImageFormat,
} from "./step1_downloadFrames.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONCURRENCY = 5;

// ── Structured logger ─────────────────────────────────────────────────────

type LogEvent = {
  step: "step1_mcp";
  slug: string;
  event: string;
  durationMs?: number;
  frameCount?: number;
  retryCount?: number;
  format?: string;
  [key: string]: unknown;
};

function log(event: Omit<LogEvent, "step">): void {
  process.stdout.write(JSON.stringify({ step: "step1_mcp", ...event } as LogEvent) + "\n");
}

// ── Concurrency helper (identical to step1_downloadFrames.ts) ─────────────

async function concurrentMap<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ── Types (local aliases to avoid import cycle) ───────────────────────────

type Step1Input = {
  slug: string;
  insertion_airport: string;
  extraction_airport: string;
  coordinates?: Array<[number, number]>;
  road_coordinates?: Array<[number, number]>;
};

type ImageFormat = "png" | "webp";

type Step1Options = {
  keepLocalFrames?: boolean;
  buildArchive?: boolean;
  imageFormat?: ImageFormat;
  frameCount?: number;
  bucket: import("@google-cloud/storage").Bucket;
  localTempBaseDir?: string;
};

type Step1Result = {
  slug: string;
  totalFrames: number;
  successfulFrames: number;
  retryCount: number;
  uploadedPaths: string[];
  completeMarkerPath: string;
  localTempDir: string;
};

// ── Airport coords loader ─────────────────────────────────────────────────

import airportCoordsRaw from "./data/airportCoords.json" with { type: "json" };
const AIRPORT_COORDS = airportCoordsRaw as unknown as Record<string, [number, number]>;

function lookupAirport(code: string): [number, number] {
  const coords = AIRPORT_COORDS[code];
  if (!coords) throw new Error(`[Step1MCP] Unknown airport code: ${code}`);
  return coords;
}

function getVisibleOverlayCoords(
  frameIndex: number,
  overlayCoords: Array<[number, number]>,
  diveFrames: number,
  flyoverFrames: number,
): Array<[number, number]> {
  if (frameIndex < diveFrames) {
    return overlayCoords.slice(0, 2);
  }

  if (frameIndex < diveFrames + flyoverFrames) {
    const flyoverProgress = (frameIndex - diveFrames) / flyoverFrames;
    const visibleCount = Math.max(2, Math.round(flyoverProgress * overlayCoords.length));
    return overlayCoords.slice(0, visibleCount);
  }

  return overlayCoords;
}

// ── Main export ───────────────────────────────────────────────────────────

export async function downloadFramesMCP(
  mission: Step1Input,
  options: Step1Options,
): Promise<Step1Result> {
  const { slug } = mission;
  const {
    bucket,
    buildArchive = false,
    keepLocalFrames = false,
    imageFormat = "png",
    frameCount = 150,
  } = options;
  const pipelineStart = Date.now();

  const localTempBaseDir =
    options.localTempBaseDir ?? path.resolve(__dirname, "temp_frames");
  const localTempDir = path.join(localTempBaseDir, slug, "frames");

  const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.REMOTION_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;
  if (!MAPBOX_TOKEN) throw new Error("[Step1MCP] MAPBOX_ACCESS_TOKEN missing from environment");

  log({ slug, event: "start", format: imageFormat, source: "mcp" });
  console.log(`\n[Step1MCP] Starting MCP-based frame acquisition for: ${slug} (format=${imageFormat})`);
  console.log(`[Step1MCP] Local staging dir: ${localTempDir}`);
  console.warn("[Step1MCP] MCP static_map_image_tool does not support bearing/pitch; frames render north-up.");

  // ── Connect to Mapbox MCP server ──────────────────────────────────────

  const mcp = new MapboxMCPClient(MAPBOX_TOKEN);
  await mcp.connect();

  try {
    // ── Resolve airport coordinates ──────────────────────────────────────

    let origin: [number, number];
    let destination: [number, number];

    if (mission.road_coordinates?.length && mission.road_coordinates.length >= 2) {
      // Use first/last of existing road_coordinates if supplied
      origin = mission.road_coordinates[0];
      destination = mission.road_coordinates[mission.road_coordinates.length - 1];
    } else if (mission.coordinates?.length && mission.coordinates.length >= 2) {
      origin = mission.coordinates[0];
      destination = mission.coordinates[mission.coordinates.length - 1];
    } else {
      origin = lookupAirport(mission.insertion_airport);
      destination = lookupAirport(mission.extraction_airport);
    }

    // ── Fetch road-snapped route from directions_tool ───────────────────

    console.log(
      `[Step1MCP] Requesting road-snapped route: [${origin}] → [${destination}]`,
    );
    const routeStart = Date.now();
    const roadCoords = await mcp.getRouteCoordinates(origin, destination);
    const routeMs = Date.now() - routeStart;

    log({ slug, event: "route_fetched", durationMs: routeMs, points: roadCoords.length });
    console.log(`[Step1MCP] Route resolved: ${roadCoords.length} road-snapped points (${routeMs}ms)`);

    // ── Build frame plan ─────────────────────────────────────────────────

    const framePlan = buildFramePlan(roadCoords, { totalFrames: frameCount, durationSeconds: 24 });
    const overlayCoords = buildOverlayCoords(roadCoords);

    console.log(
      `[Step1MCP] Frame plan ready: ${framePlan.totalFrames} frames, ` +
      `${framePlan.durationSeconds}s, bounds=[${framePlan.bounds.join(", ")}]`,
    );

    // ── Prepare local temp dir ───────────────────────────────────────────

    await fsp.mkdir(localTempDir, { recursive: true });

    // ── Download (render) frames via MCP static_map_image_tool ──────────

    let successCount = 0;

    const framePaths: string[] = framePlan.frames.map((entry) =>
      path.join(localTempDir, `frame_${String(entry.frameIndex).padStart(4, "0")}.${imageFormat}`),
    );

    const downloadStart = Date.now();

    await concurrentMap(framePlan.frames, CONCURRENCY, async (entry) => {
      const framePath = framePaths[entry.frameIndex];

      // Resumability: skip already-downloaded frames
      if (fs.existsSync(framePath)) {
        successCount++;
        return;
      }

      const visibleOverlayCoords = getVisibleOverlayCoords(
        entry.frameIndex,
        overlayCoords,
        framePlan.diveFrames,
        framePlan.flyoverFrames,
      );
      const visiblePolyline = encodePolyline(visibleOverlayCoords);

      const pngBuffer = await mcp.renderFrame({
        longitude: entry.lng,
        latitude: entry.lat,
        zoom: entry.zoom,
        bearing: entry.bearing,
        pitch: entry.pitch,
        glowPolyline: visiblePolyline,
        corePolyline: visiblePolyline,
      });

      // MCP returns PNG; convert to WebP if requested
      if (imageFormat === "webp") {
        const { default: sharp } = await import("sharp");
        const webpBuffer = await sharp(pngBuffer).webp({ quality: 95 }).toBuffer();
        await fsp.writeFile(framePath, webpBuffer);
      } else {
        await fsp.writeFile(framePath, pngBuffer);
      }

      successCount++;

      if (entry.frameIndex % 100 === 0) {
        console.log(
          `[Step1MCP] Frame ${entry.frameIndex}/${framePlan.totalFrames} rendered ` +
          `(${Math.round((Date.now() - downloadStart) / 1000)}s elapsed)`,
        );
      }
    });

    const downloadMs = Date.now() - downloadStart;
    log({ slug, event: "frames_rendered", durationMs: downloadMs, frameCount: successCount, format: imageFormat });
    console.log(
      `[Step1MCP] Render complete: ${successCount}/${framePlan.totalFrames} frames in ${Math.round(downloadMs / 1000)}s`,
    );

    // ── Write metadata files ─────────────────────────────────────────────

    const metadataDir = path.join(localTempBaseDir, slug);

    const metadata: FramesMetadata = {
      mission: slug,
      totalFrames: framePlan.totalFrames,
      durationSeconds: framePlan.durationSeconds,
      routePoints: framePlan.routePoints,
      generatedAt: new Date().toISOString(),
      bounds: framePlan.bounds,
      fullRoutePolyline: framePlan.fullRoutePolyline,
      cameraRoutePolyline: framePlan.cameraRoutePolyline,
    };

    const cameraState: CameraStateEntry[] = framePlan.frames.map((entry) => ({
      frame: entry.frameIndex,
      lng: entry.lng,
      lat: entry.lat,
      zoom: entry.zoom,
      bearing: entry.bearing,
      pitch: entry.pitch,
    }));

    const manifest = buildManifest(framePlan.totalFrames, imageFormat);

    await fsp.writeFile(path.join(metadataDir, "metadata.json"), JSON.stringify(metadata, null, 2));
    await fsp.writeFile(path.join(metadataDir, "camera_state.json"), JSON.stringify(cameraState, null, 2));
    await fsp.writeFile(path.join(metadataDir, "manifest.json"), JSON.stringify(manifest, null, 2));

    console.log(`[Step1MCP] Metadata files written locally`);

    // ── Optional archive ─────────────────────────────────────────────────

    if (buildArchive) {
      const archivePath = path.join(metadataDir, "frames.tar.gz");
      console.log(`[Step1MCP] Building archive: ${archivePath}`);
      execSync(`tar -czf "${archivePath}" -C "${metadataDir}" frames`, { stdio: "inherit" });
      console.log(`[Step1MCP] Archive created`);
    }

    // ── Upload to Firebase Storage ───────────────────────────────────────

    const storagePaths = getFrameStoragePaths(slug);
    const uploadedPaths: string[] = [];
    const contentType = imageFormat === "webp" ? "image/webp" : "image/png";

    console.log(`[Step1MCP] Uploading ${framePlan.totalFrames} frames to Firebase Storage...`);
    const uploadStart = Date.now();

    await concurrentMap(framePlan.frames, CONCURRENCY, async (entry) => {
      const localPath = framePaths[entry.frameIndex];
      const destPath = storagePaths.frameFile(entry.frameIndex);
      await bucket.upload(localPath, { destination: destPath, metadata: { contentType } });
      uploadedPaths.push(destPath);
    });

    const uploadMs = Date.now() - uploadStart;
    log({ slug, event: "frames_uploaded", durationMs: uploadMs, frameCount: framePlan.totalFrames });
    console.log(`[Step1MCP] Frames uploaded in ${Math.round(uploadMs / 1000)}s`);

    // Upload metadata files
    for (const [localFile, storageDest] of [
      [path.join(metadataDir, "metadata.json"), storagePaths.metadataFile],
      [path.join(metadataDir, "camera_state.json"), storagePaths.cameraStateFile],
      [path.join(metadataDir, "manifest.json"), storagePaths.manifestFile],
    ] as Array<[string, string]>) {
      await bucket.upload(localFile, { destination: storageDest, metadata: { contentType: "application/json" } });
      uploadedPaths.push(storageDest);
      console.log(`[Step1MCP] Uploaded: ${storageDest}`);
    }

    if (buildArchive) {
      const archivePath = path.join(metadataDir, "frames.tar.gz");
      await bucket.upload(archivePath, {
        destination: storagePaths.archiveFile,
        metadata: { contentType: "application/gzip" },
      });
      uploadedPaths.push(storagePaths.archiveFile);
      console.log(`[Step1MCP] Archive uploaded`);
    }

    // ── complete.json — LAST (completion signal) ─────────────────────────

    const completeMarker = buildCompleteMarker(successCount);
    const completeLocalPath = path.join(metadataDir, "complete.json");
    await fsp.writeFile(completeLocalPath, JSON.stringify(completeMarker, null, 2));
    await bucket.upload(completeLocalPath, {
      destination: storagePaths.completeFile,
      metadata: { contentType: "application/json" },
    });
    uploadedPaths.push(storagePaths.completeFile);

    const totalMs = Date.now() - pipelineStart;
    log({
      slug,
      event: "complete",
      durationMs: totalMs,
      frameCount: successCount,
      format: imageFormat,
      uploadedCount: uploadedPaths.length,
      source: "mcp",
    });
    console.log(
      `[Step1MCP] ✅ complete.json uploaded — Step 1 (MCP) done.\n` +
      `[Step1MCP] Total uploaded: ${uploadedPaths.length} objects\n` +
      `[Step1MCP] Pipeline time: ${Math.round(totalMs / 1000)}s`,
    );

    // ── Cleanup ───────────────────────────────────────────────────────────

    if (!keepLocalFrames) {
      await fsp.rm(path.join(localTempBaseDir, slug), { recursive: true, force: true });
      console.log(`[Step1MCP] Local temp dir cleaned up`);
    }

    return {
      slug,
      totalFrames: framePlan.totalFrames,
      successfulFrames: successCount,
      retryCount: 0, // MCP handles retries internally; we don't track separately
      uploadedPaths,
      completeMarkerPath: storagePaths.completeFile,
      localTempDir,
    };
  } finally {
    mcp.close();
  }
}
