import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fetch from 'node-fetch';
import TurndownService from 'turndown';
// Environment configuration
const BASE_URL = process.env.BASE_URL || '';
const API_KEY = process.env.API_KEY || '';
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '4096');
const MAX_CONTEXT_LENGTH = parseInt(process.env.MAX_CONTEXT_LENGTH || '32768');
const MODEL = process.env.MODEL || 'gpt-3.5-turbo';

// Initialize Turndown for HTML to markdown conversion
const turndownService = new TurndownService();

/**
 * Convert HTML string to markdown.
 */
function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

/**
 * Estimate token count for a given text.
 * Simple heuristic: 1 token ≈ 4 characters.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Summarize the markdown content using the external LLM endpoint.
 */
async function summarizeContent(markdown: string, context?: string): Promise<string> {
  const prompt = `You are an expert summarizing engine. Summarize the content below down to a MAXIMUM of ${MAX_TOKENS} tokens.\n\n${context ? `Use the following context to guide your summarization: ${context}\n\n` : ''}IMPORTANT: outputs your summary ONLY. In markdown format. NOTHING ELSE.\n\nCONTENT:\n${markdown}`;
  const body = {
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
  };
  const headers: any = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Summarization API error ${response.status}: ${errText}`);
  }
  const data = (await response.json()) as any;
  const message = data?.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error('Summarization response missing content');
  }
  return message.trim();
}

/**
 * Fetch a URL, convert it to markdown, and optionally summarize if too large.
 */
export async function fetchUrlTool(params: { url: string; context?: string }) {
  const { url, context } = params;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch URL ${url}: ${resp.status} ${resp.statusText}`);
  }
  const html = await resp.text();
  const markdown = htmlToMarkdown(html);
  const tokenCount = estimateTokens(markdown);
  if (tokenCount > MAX_TOKENS) {
    const summary = await summarizeContent(markdown, context);
    return { content: [{ type: 'text' as const, text: summary }], structuredContent: summary } as any;
  }
  return { content: [{ type: 'text' as const, text: markdown }], structuredContent: markdown } as any;
}

// Create the MCP server and register the fetch_url tool
const server = new McpServer({ name: 'websum-mcp', version: '0.1.0' });

server.registerTool(
  'fetch_url',
  {
    title: 'Fetch and summarize a web page',
    description: 'Fetch a webpage, convert to markdown, and optionally summarize it.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the web page to fetch'),
      context: z.string().optional().describe('Optional short context to guide summarization'),
    }),
    outputSchema: z.object({
      content: z.array(
        z.object({
          type: z.literal('text'),
          text: z.string(),
        })
      ),
      structuredContent: z.string(),
    }),
  },
  async (args, _extra) => {
    // Explicitly cast return type to any to satisfy MCP server type expectations
    return (await fetchUrlTool(args)) as any;
  }
);

// Connect the server via stdio transport for CLI usage
(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
})();
