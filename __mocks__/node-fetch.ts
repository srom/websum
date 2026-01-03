// __mocks__/node-fetch.ts
import type { RequestInfo, RequestInit } from 'node-fetch';

const mockFetch = jest.fn(async (url: RequestInfo, init?: RequestInit) => {
  const urlStr = typeof url === 'string' ? url : url.toString();
  // Summarization endpoint
  if (urlStr.includes('/chat/completions')) {
    return {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Summarized content' } }],
      }),
    } as any;
  }
  // Web page fetch
  return {
    ok: true,
    text: async () => '<html><body>Mock page content</body></html>',
  } as any;
});

export default mockFetch;
