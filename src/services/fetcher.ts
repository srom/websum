import axios from 'axios';
import TurndownService from 'turndown';
import { config } from '../config.js';

export async function fetchAndConvert(url: string): Promise<string> {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("URL must start with http:// or https://")
  }
  try {
    const timeout = config.requestTimeout * 1000;
    const maxPayload = config.maxPayloadSize * 1024 * 1024;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'text/markdown;q=1.0, text/x-markdown;q=0.9, text/plain;q=0.8, text/html;q=0.7, */*;q=0.1',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: timeout,
      maxContentLength: maxPayload,
      maxBodyLength: maxPayload,
    });

    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('text/html')) {
      // If it's not HTML, just return the text data if possible
      if (typeof response.data === 'string') {
        return response.data;
      }
      return JSON.stringify(response.data);
    }

    const html = response.data;
    const markdown = convertHTMLToMarkdown(html);
    return markdown;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch URL ${url}: ${error.message}`);
    }
    throw error;
  }
}

function convertHTMLToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  })
  turndownService.remove(["script", "style", "meta", "link"])
  return turndownService.turndown(html)
}
