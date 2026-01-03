#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { fetchUrlTool } from './tools/fetch_url.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

const server = new Server(
  {
    name: 'websum',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: fetchUrlTool.name,
        description: fetchUrlTool.description,
        inputSchema: zodToJsonSchema(fetchUrlTool.parameters) as any,
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'fetch_url') {
    const params = fetchUrlTool.parameters.parse(request.params.arguments);
    return await fetchUrlTool.execute(params as { url: string; context?: string });
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('websum MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
