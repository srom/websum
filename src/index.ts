#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchAndConvert } from "./services/fetcher.js";
import { summarizeIfNeeded } from "./services/summarizer.js";
import { config } from './config.js';

const server = new McpServer({
  name: "websum",
  version: "0.4.0"
});

server.registerTool(
    "fetch_url",
    {
        description: "Fetch a webpage, convert to markdown, and summarize if necessary.",
        inputSchema: {
            url: z.string().url().describe("The URL to fetch."),
            context: z.string().optional().describe("The specific information you need from the page to ensure a relevant summary.")
        }
    },
    async ({ url, context }) => {
        try {
            const markdown = await fetchAndConvert(url);
            const summary_obj = await summarizeIfNeeded(markdown, context);
            let output = summary_obj.content
            if (summary_obj.summarized) {
                output = `URL content summarized by AI model '${config.modelName}':\n${output}`;
            }
            return {
                content: [
                    {
                        type: "text",
                        text: output
                    }
                ]
            };
        } catch (error: any) {
             return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${error.message}`
                    }
                ],
                isError: true,
            };
        }
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Websum MCP server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
