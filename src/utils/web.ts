import axios from 'axios';
import TurndownService from 'turndown';

export async function fetchUrl(url: string): Promise<{ content: string; contentType: string }> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    responseType: 'text',
  });

  return {
    content: response.data,
    contentType: response.headers['content-type'] || 'text/html',
  };
}

export function convertHtmlToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
  });

  // Remove script and style elements
  turndownService.remove(['script', 'style', 'noscript', 'iframe', 'object', 'embed', 'head', 'meta', 'link']);

  return turndownService.turndown(html);
}
