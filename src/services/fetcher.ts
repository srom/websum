import axios from 'axios';
import TurndownService from 'turndown';

const turndownService = new TurndownService({ headingStyle: 'atx' });

export async function fetchAndConvert(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'websum-mcp/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 10000 // 10 seconds timeout
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
    const markdown = turndownService.turndown(html);
    return markdown;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch URL ${url}: ${error.message}`);
    }
    throw error;
  }
}
