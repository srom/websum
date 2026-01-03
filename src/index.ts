#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { fetchUrl } from "./tools/fetchUrl.js";
import { getConfig } from "./config.js";

// Validate configuration on startup
const config = getConfig();

// Create server instance
const server = new Server(
  {
    name: "websum-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the fetch_url tool schema
const FetchUrlArgsSchema = z.object({
  url: z.string().url().describe("The URL to fetch and process"),
  context: z
    .string()
    .optional()
    .describe(
      "Optional context about what knowledge is being sought from this URL"
    ),
});

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "fetch_url",
        description:
          "Fetches a webpage, converts it to markdown, and optionally summarizes it if the content exceeds the token limit. Returns the processed content.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to fetch and process",
            },
            context: {
              type: "string",
              description:
                "Optional context about what knowledge is being sought from this URL",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "fetch_url") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = FetchUrlArgsSchema.parse(request.params.arguments);

  try {
    const result = await fetchUrl(args.url, args.context, config);

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text",
          text: `Error fetching URL: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("WebSum MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
