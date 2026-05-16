import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// Import from strictly bounded contexts
import { 
  getAirport, 
  getMotorcycleCatalog, 
  getMissionIntel, 
  getRegionalRoutes, 
  getRenderAssetsForMission 
} from './catalog.js';
import { 
  getAvailableA2aMissions, 
  getRentalInventoryForAirport 
} from './graph.js';
import { 
  getAirportExperience,
  getDualPathPayload
} from './aggregators.js';

const server = new Server(
  {
    name: "jetmymoto-firestore-mcp",
    version: "2.1.0",
  },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // --- CATALOG TOOLS (FIRESTORE) ---
      {
        name: "get_airport",
        description: "[CATALOG] Get operational metadata for a specific airport hub directly from Firestore",
        inputSchema: { type: "object", properties: { code: { type: "string" } }, required: ["code"] }
      },
      {
        name: "get_motorcycle_catalog",
        description: "[CATALOG] Get raw global motorcycle catalog data from Firestore by slug or ID. Does NOT return availability.",
        inputSchema: { type: "object", properties: { slug_or_id: { type: "string" } }, required: ["slug_or_id"] }
      },
      {
        name: "get_mission_intel",
        description: "[CATALOG] Get narrative/regional intelligence for a mission ID (e.g., 'RA028') from Firestore.",
        inputSchema: { type: "object", properties: { mission_id: { type: "string" } }, required: ["mission_id"] }
      },
      {
        name: "get_regional_routes",
        description: "[CATALOG] Get telemetry/trunk routes tagged with a specific region (e.g., 'central-alps').",
        inputSchema: { type: "object", properties: { region_tag: { type: "string" } }, required: ["region_tag"] }
      },
      {
        name: "get_render_assets_for_mission",
        description: "[CATALOG] Get render assets and jobs associated with a mission ID.",
        inputSchema: { type: "object", properties: { mission_id: { type: "string" } }, required: ["mission_id"] }
      },
      // --- GRAPH TOOLS (JSON) ---
      {
        name: "get_available_a2a_missions",
        description: "[GRAPH] Get curated product graph A2A missions originating from an airport code.",
        inputSchema: { type: "object", properties: { airport_code: { type: "string" } }, required: ["airport_code"] }
      },
      {
        name: "get_rental_inventory_for_airport",
        description: "[GRAPH] Get qualifying rental IDs and human-readable parsed labels for an airport. Returns synthetic IDs, NOT catalog references.",
        inputSchema: { type: "object", properties: { airport_code: { type: "string" } }, required: ["airport_code"] }
      },
      // --- AGGREGATION TOOLS ---
      {
        name: "get_airport_experience",
        description: "[AGGREGATOR] Returns the complete product-driven experience for an airport page, including ride_local and bring_your_own decisions.",
        inputSchema: { type: "object", properties: { airport_code: { type: "string" } }, required: ["airport_code"] }
      },
      {
        name: "get_dual_path_payload",
        description: "[AGGREGATOR] Returns the core UX decision layer (Rent vs BYO) for an airport hub.",
        inputSchema: { type: "object", properties: { airport_code: { type: "string" } }, required: ["airport_code"] }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    let result: any;
    switch (name) {
      // Catalog
      case "get_airport": result = await getAirport(String(args?.code)); break;
      case "get_motorcycle_catalog": result = await getMotorcycleCatalog(String(args?.slug_or_id)); break;
      case "get_mission_intel": result = await getMissionIntel(String(args?.mission_id)); break;
      case "get_regional_routes": result = await getRegionalRoutes(String(args?.region_tag)); break;
      case "get_render_assets_for_mission": result = await getRenderAssetsForMission(String(args?.mission_id)); break;
      // Graph
      case "get_available_a2a_missions": result = await getAvailableA2aMissions(String(args?.airport_code)); break;
      case "get_rental_inventory_for_airport": result = await getRentalInventoryForAirport(String(args?.airport_code)); break;
      // Aggregation
      case "get_airport_experience": result = await getAirportExperience(String(args?.airport_code)); break;
      case "get_dual_path_payload": result = await getDualPathPayload(String(args?.airport_code)); break;
      
      default: throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
    return { content: [{ type: "text", text: JSON.stringify(result || { message: "No data found" }, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error executing ${name}: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("JetMyMoto Firestore MCP Server v2.1 running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});