import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUrlTool } from '../src/tools/fetch_url.js';
import * as webUtils from '../src/utils/web.js';
import * as llmUtils from '../src/utils/llm.js';
import { config } from '../src/utils/config.js';

vi.mock('../src/utils/web.js', () => ({
  fetchUrl: vi.fn(),
  convertHtmlToMarkdown: vi.fn((html) => html.includes('<h1>') ? '# Test\n\nHello world' : html),
}));

vi.mock('../src/utils/llm.js', () => ({
  estimateTokens: vi.fn(),
  summarize: vi.fn(),
}));

describe('fetch_url tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return markdown if content is within MAX_TOKENS', async () => {
    const mockContent = '<h1>Test</h1><p>Hello world</p>';
    vi.mocked(webUtils.fetchUrl).mockResolvedValue({
      content: mockContent,
      contentType: 'text/html',
    });
    vi.mocked(llmUtils.estimateTokens).mockReturnValue(5);

    const result = await fetchUrlTool.execute({ url: 'https://example.com' });

    expect(result.isError).toBeFalsy();
    const content = result.content as any[];
    expect(content[0].type).toBe('text');
    expect(content[0].text).toContain('# Test');
    expect(content[0].text).toContain('Hello world');
    expect(webUtils.fetchUrl).toHaveBeenCalledWith('https://example.com');
    expect(llmUtils.summarize).not.toHaveBeenCalled();
  });

  it('should return summary if content exceeds MAX_TOKENS', async () => {
    const mockContent = 'A'.repeat(100); 
    vi.mocked(webUtils.fetchUrl).mockResolvedValue({
      content: mockContent,
      contentType: 'text/plain',
    });
    vi.mocked(llmUtils.estimateTokens).mockReturnValue(100);
    vi.mocked(llmUtils.summarize).mockResolvedValue('This is a summary');

    // Temporarily set MAX_TOKENS to something small
    const originalMaxTokens = config.MAX_TOKENS;
    (config as any).MAX_TOKENS = 10;

    const result = await fetchUrlTool.execute({ url: 'https://example.com' });

    expect(result.isError).toBeFalsy();
    const content = result.content as any[];
    expect(content[0].text).toBe('This is a summary');
    expect(llmUtils.summarize).toHaveBeenCalled();

    // Restore MAX_TOKENS
    (config as any).MAX_TOKENS = originalMaxTokens;
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(webUtils.fetchUrl).mockRejectedValue(new Error('Network error'));

    const result = await fetchUrlTool.execute({ url: 'https://example.com' });

    expect(result.isError).toBe(true);
    const content = result.content as any[];
    expect(content[0].text).toContain('Error: Network error');
  });
});
