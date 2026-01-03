import { z } from 'zod';
import { fetchUrl, convertHtmlToMarkdown } from '../utils/web.js';
import { estimateTokens, summarize } from '../utils/llm.js';
import { config } from '../utils/config.js';

export const fetchUrlTool = {
  name: 'fetch_url',
  description: 'Fetches a webpage, turns its content into markdown and optionally summarizes it if the content is larger than MAX_TOKENS.',
  parameters: z.object({
    url: z.string().describe('The url pointing to the web content that will be downloaded, turned into markdown and summarized.'),
    context: z.string().optional().describe('Provides a short description about what knowledge the model is looking to gather from the content of this URL.'),
  }),
  execute: async (params: { url: string; context?: string }) => {
    const { url, context } = params;

    try {
      const { content, contentType } = await fetchUrl(url);
      
      let markdown = content;
      if (contentType.includes('text/html')) {
        markdown = convertHtmlToMarkdown(content);
      }

      const tokenCount = estimateTokens(markdown);

      if (tokenCount > config.MAX_TOKENS) {
        const summary = await summarize(markdown, config.MAX_TOKENS, context);
        return {
          content: [
            {
              type: 'text',
              text: summary,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: markdown,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};
