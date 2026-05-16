/**
 * mapboxMCPClient.ts
 *
 * Thin JSON-RPC 2.0 stdio client for the Mapbox MCP server.
 *
 * Spawns the server process from the workspace-level install, performs the
 * MCP initialization handshake, then exposes typed helpers for the two tools
 * this pipeline needs:
 *
 *   - getRouteCoordinates()  →  calls directions_tool (road-snapped geometry)
 *   - renderFrame()          →  calls static_map_image_tool (returns PNG Buffer)
 *
 * The caller is responsible for calling close() when done.
 *
 * Design rules:
 *   - No HTTP retry logic — the MCP server owns transport resilience
 *   - No access-token handling — token lives in the spawned process env
 *   - All frame rendering is CPU-bound (image decode) once response arrives
 */

import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve the MCP server entry point relative to the workspace root
const MCP_SERVER_PATH = path.resolve(
  __dirname,
  "../../../.mcp-servers/mapbox/node_modules/@mapbox/mcp-server/dist/esm/index.js",
);

// ── Types ─────────────────────────────────────────────────────────────────

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params?: unknown;
};

type JsonRpcNotification = {
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: string;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

export type RouteCoordinates = Array<[number, number]>;

export type RenderFrameInput = {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
  /** Encoded polyline for the amber glow route overlay */
  glowPolyline?: string;
  /** Encoded polyline for the white core route overlay */
  corePolyline?: string;
};

// ── Client ────────────────────────────────────────────────────────────────

export class MapboxMCPClient {
  private proc: ChildProcess | null = null;
  private lineBuffer = "";
  private pending = new Map<
    string,
    {
      resolve: (v: unknown) => void;
      reject: (e: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();
  private msgId = 0;
  private ready = false;
  private token: string;
  private closed = false;

  private static readonly REQUEST_TIMEOUT_MS = 30_000;

  constructor(token: string) {
    this.token = token;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    this.closed = false;
    this.proc = spawn("node", [MCP_SERVER_PATH], {
      env: {
        ...process.env,
        MAPBOX_ACCESS_TOKEN: this.token,
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    if (!this.proc.stdout || !this.proc.stdin) {
      throw new Error("[MCP] Failed to open stdio pipes to Mapbox MCP server");
    }

    this.proc.stdin.setMaxListeners(0);

    // Route stderr to our console for debugging
    this.proc.stderr?.on("data", (chunk: Buffer) => {
      process.stderr.write(`[MCP server] ${chunk.toString()}`);
    });

    // Wire stdout line reader
    this.proc.stdout.on("data", (chunk: Buffer) => {
      this.lineBuffer += chunk.toString();
      const lines = this.lineBuffer.split("\n");
      this.lineBuffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) this.handleLine(trimmed);
      }
    });

    this.proc.on("error", (err) => {
      this.rejectPending(new Error(`[MCP] Server process error: ${err.message}`));
    });

    this.proc.on("exit", (code, signal) => {
      this.rejectPending(
        new Error(`[MCP] Server process exited (code=${code ?? "null"}, signal=${signal ?? "null"})`),
      );
    });

    this.proc.on("close", (code, signal) => {
      this.rejectPending(
        new Error(`[MCP] Server process closed (code=${code ?? "null"}, signal=${signal ?? "null"})`),
      );
    });

    // MCP initialization handshake
    await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      clientInfo: { name: "jetmymoto-video-engine", version: "1.0.0" },
    });

    // Confirm initialization
    this.sendNotification("notifications/initialized", {});
    this.ready = true;
    console.log("[MCP] Mapbox MCP server ready");
  }

  close(): void {
    this.closed = true;
    this.rejectPending(new Error("[MCP] Client closed"));
    this.proc?.kill();
    this.proc = null;
    this.ready = false;
  }

  // ── JSON-RPC core ────────────────────────────────────────────────────────

  private handleLine(line: string): void {
    let msg: JsonRpcResponse;
    try {
      msg = JSON.parse(line) as JsonRpcResponse;
    } catch {
      return; // Non-JSON line (e.g. debug output)
    }

    if (msg.id && this.pending.has(msg.id)) {
      const { resolve, reject, timeout } = this.pending.get(msg.id)!;
      clearTimeout(timeout);
      this.pending.delete(msg.id);
      if (msg.error) {
        reject(new Error(`[MCP] ${msg.error.message} (code ${msg.error.code})`));
      } else {
        resolve(msg.result);
      }
    }
  }

  private sendNotification(method: string, params: unknown): void {
    const msg: JsonRpcNotification = { jsonrpc: "2.0", method, params };
    this.writeRaw(JSON.stringify(msg));
  }

  private sendRequest(method: string, params: unknown): Promise<unknown> {
    if (this.closed || !this.proc?.stdin) {
      return Promise.reject(new Error("[MCP] Cannot send request on closed client"));
    }

    const id = String(++this.msgId);
    const req: JsonRpcRequest = { jsonrpc: "2.0", id, method, params };
    return new Promise<unknown>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`[MCP] Request timed out after ${MapboxMCPClient.REQUEST_TIMEOUT_MS}ms: ${method}`));
      }, MapboxMCPClient.REQUEST_TIMEOUT_MS);

      this.pending.set(id, { resolve, reject, timeout });
      this.writeRaw(JSON.stringify(req));
    });
  }

  private writeRaw(line: string): void {
    this.proc?.stdin?.write(line + "\n");
  }

  private rejectPending(error: Error): void {
    if (this.pending.size === 0) {
      return;
    }

    for (const [id, pending] of this.pending.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(error);
      this.pending.delete(id);
    }
  }

  // ── Tool helpers ─────────────────────────────────────────────────────────

  /**
   * Call the MCP tools/call method with the given tool name and arguments.
   */
  private async callTool(name: string, args: unknown): Promise<unknown> {
    if (!this.ready) throw new Error("[MCP] Client not connected. Call connect() first.");
    return this.sendRequest("tools/call", { name, arguments: args });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Get road-snapped route coordinates between two [lng,lat] points.
   * Uses directions_tool (mapbox/driving profile, GeoJSON geometry).
   * Returns full resolution coordinate array.
   *
   * For long routes, the MCP server stores geometry as a temporary resource
   * (>50KB threshold). This method detects that case and reads the resource
   * via resources/read to retrieve the full geometry.
   */
  async getRouteCoordinates(
    origin: [number, number],
    destination: [number, number],
  ): Promise<RouteCoordinates> {
    const result = await this.callTool("directions_tool", {
      coordinates: [
        { longitude: origin[0], latitude: origin[1] },
        { longitude: destination[0], latitude: destination[1] },
      ],
      routing_profile: "mapbox/driving",
      geometries: "geojson",
      alternatives: false,
    }) as { content: Array<{ type: string; text?: string }> };

    const textContent = result.content?.find((c) => c.type === "text");
    if (!textContent?.text) {
      throw new Error("[MCP] directions_tool returned no text content");
    }

    const text = textContent.text;

    // ── Large route: geometry stored as temp resource ─────────────────────
    // The tool emits "Resource URI: mapbox://temp/directions-<hex>" when the
    // GeoJSON exceeds the 50KB context threshold. Retrieve it via resources/read.
    const resourceUriMatch = text.match(/Resource URI:\s*(mapbox:\/\/temp\/directions-[a-f0-9]+)/);
    if (resourceUriMatch) {
      const resourceUri = resourceUriMatch[1];
      console.log(`[MCP] Route geometry stored as temp resource — reading: ${resourceUri}`);

      const resourceResult = await this.sendRequest("resources/read", {
        uri: resourceUri,
      }) as { contents: Array<{ uri: string; mimeType?: string; text?: string }> };

      const resourceContent = resourceResult.contents?.find((c) => c.text);
      if (!resourceContent?.text) {
        throw new Error(`[MCP] resources/read returned no text content for ${resourceUri}`);
      }

      const parsed = JSON.parse(resourceContent.text) as {
        routes?: Array<{ geometry?: { coordinates?: Array<[number, number]> } }>;
      };
      const coords = parsed.routes?.[0]?.geometry?.coordinates;
      if (!coords?.length) {
        throw new Error("[MCP] resources/read: no route geometry found in resource data");
      }
      return coords;
    }

    // ── Small route: full JSON returned inline ────────────────────────────
    try {
      const parsed = JSON.parse(text) as {
        routes?: Array<{ geometry?: { coordinates?: Array<[number, number]> } }>;
      };
      const coords = parsed.routes?.[0]?.geometry?.coordinates;
      if (!coords?.length) {
        throw new Error("[MCP] directions_tool: no route geometry in response");
      }
      return coords;
    } catch (e) {
      throw new Error(
        `[MCP] directions_tool response is not parseable JSON. ` +
        `Response: "${text.substring(0, 300)}" — Original error: ${(e as Error).message}`,
      );
    }
  }

  /**
   * Render one map frame using static_map_image_tool.
   * Returns the raw PNG as a Buffer.
   *
   * Response layout from StaticMapImageTool:
   *   content[0] = { type: "text", text: publicUrl }        — always present (URL for display)
   *   content[1] = { type: "image", data: base64, mimeType } — small images (<700KB, inlined)
   *   content[1] = { type: "text", text: "⚠️ ...Resource URI: mapbox://temp/static-map-<id>" }
   *                                                          — large images (stored as resource)
   */
  async renderFrame(input: RenderFrameInput): Promise<Buffer> {
    const overlays: unknown[] = [];

    if (input.glowPolyline) {
      overlays.push({
        type: "path",
        encodedPolyline: input.glowPolyline,
        strokeWidth: 24,
        strokeColor: "CDA755",
        strokeOpacity: 0.6,
      });
    }
    if (input.corePolyline) {
      overlays.push({
        type: "path",
        encodedPolyline: input.corePolyline,
        strokeWidth: 5,
        strokeColor: "ffffff",
        strokeOpacity: 1.0,
      });
    }

    const result = await this.callTool("static_map_image_tool", {
      center: { longitude: input.longitude, latitude: input.latitude },
      zoom: Math.min(Math.max(input.zoom, 0), 22),
      size: { width: 1280, height: 720 },
      style: "mapbox/dark-v11",
      highDensity: true,
      overlays: overlays.length > 0 ? overlays : undefined,
    }) as { content: Array<{ type: string; text?: string; data?: string; mimeType?: string }> };

    // ── Case 1: inline base64 image (small frame) ─────────────────────────
    const imageContent = result.content?.find((c) => c.type === "image");
    if (imageContent?.data) {
      return Buffer.from(imageContent.data, "base64");
    }

    // ── Case 2: large image stored as temporary resource ──────────────────
    // content[1].text = "⚠️ Image (NNNkB) stored as temporary resource.\nResource URI: mapbox://temp/static-map-<hex>"
    const resourceText = result.content?.find(
      (c) => c.type === "text" && c.text?.includes("Resource URI:"),
    );
    if (resourceText?.text) {
      const match = resourceText.text.match(/Resource URI:\s*(mapbox:\/\/temp\/static-map-[a-f0-9]+)/);
      if (match) {
        const resourceUri = match[1];
        const resourceResult = await this.sendRequest("resources/read", {
          uri: resourceUri,
        }) as { contents: Array<{ uri: string; mimeType?: string; text?: string; blob?: string }> };

        const content = resourceResult.contents?.[0];
        if (content?.blob) {
          return Buffer.from(content.blob, "base64");
        }
        if (content?.text) {
          // Some MCP implementations return base64 in text field for binary resources
          return Buffer.from(content.text, "base64");
        }
        throw new Error(`[MCP] resources/read returned no data for ${resourceUri}`);
      }
    }

    throw new Error("[MCP] static_map_image_tool returned no image data and no resource URI");
  }
}
