import TurndownService from "turndown";
import { encode } from "gpt-tokenizer";
import type { Config } from "../config.js";
import { summarizeContent } from "./summarizer.js";

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_TIMEOUT = 30 * 1000; // 30 seconds

/**
 * Fetches a URL, converts content to markdown, and optionally summarizes it
 */
export async function fetchUrl(
  url: string,
  context: string | undefined,
  config: Config
): Promise<string> {
  // Validate URL
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("URL must start with http:// or https://");
  }

  // Fetch the content
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Request failed with status code: ${response.status}`);
    }

    // Check content length
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      throw new Error("Response too large (exceeds 5MB limit)");
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_RESPONSE_SIZE) {
      throw new Error("Response too large (exceeds 5MB limit)");
    }

    const content = new TextDecoder().decode(arrayBuffer);
    const contentType = response.headers.get("content-type") || "";

    // Convert to markdown if HTML
    let markdown: string;
    if (contentType.includes("text/html")) {
      markdown = convertHTMLToMarkdown(content);
    } else {
      markdown = content;
    }

    // Count tokens
    const tokens = encode(markdown);
    const tokenCount = tokens.length;

    // If under the limit, return as-is
    if (tokenCount <= config.maxTokens) {
      return markdown;
    }

    // Otherwise, summarize
    console.error(
      `Content exceeds ${config.maxTokens} tokens (${tokenCount} tokens), summarizing...`
    );
    return await summarizeContent(markdown, context, config);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Converts HTML to markdown using Turndown
 */
function convertHTMLToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  });

  // Remove script, style, and other non-content elements
  turndownService.remove(["script", "style", "meta", "link", "noscript"]);

  return turndownService.turndown(html);
}
