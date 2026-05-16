import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable is required");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

const server = new Server(
  {
    name: "gemini-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_content",
        description: "Generate text or code using a Google Gemini model",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The prompt to send to the model",
            },
            modelName: {
              type: "string",
              description: "The Gemini model to use (e.g., gemini-1.5-flash, gemini-1.5-pro)",
              default: "gemini-1.5-flash",
            },
            temperature: {
              type: "number",
              description: "Sampling temperature (0.0 to 2.0)",
              default: 0.7,
            },
          },
          required: ["prompt"],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "generate_content") {
    try {
      const { prompt, modelName = "gemini-1.5-flash", temperature = 0.7 } = z
        .object({
          prompt: z.string(),
          modelName: z.string().optional(),
          temperature: z.number().optional(),
        })
        .parse(args);

      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
        },
      });

      const response = result.response;
      const text = response.text();

      return {
        content: [
          {
            type: "text",
            text: text,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error generating content: ${error.message}`,
          },
        ],
      };
    }
  }

  throw new Error(`Tool not found: ${name}`);
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Gemini MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
