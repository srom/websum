import { fetchUrlTool } from '../src/index';

describe('fetchUrlTool', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns markdown content when token count is within limit', async () => {
    process.env.MAX_TOKENS = '1000'; // high limit
    const { fetchUrlTool } = await import('../src/index');
    const result = await fetchUrlTool({ url: 'http://example.com' });
    expect(result.content[0].text).toContain('Mock page content');
    expect(result.structuredContent).toContain('Mock page content');
  });

  it('summarizes content when token count exceeds limit', async () => {
    process.env.MAX_TOKENS = '1'; // low limit to trigger summarisation
    const { fetchUrlTool } = await import('../src/index');
    const result = await fetchUrlTool({ url: 'http://example.com' });
    expect(result.content[0].text).toBe('Summarized content');
    expect(result.structuredContent).toBe('Summarized content');
  });
});
