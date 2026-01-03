import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertHtmlToMarkdown } from '../src/utils/web.js';
import { estimateTokens } from '../src/utils/llm.js';

describe('Web Utils', () => {
  describe('convertHtmlToMarkdown', () => {
    it('should convert simple HTML to markdown', () => {
      const html = '<h1>Hello</h1><p>World</p>';
      const markdown = convertHtmlToMarkdown(html);
      expect(markdown).toContain('# Hello');
      expect(markdown).toContain('World');
    });

    it('should remove scripts and styles', () => {
      const html = '<h1>Title</h1><script>alert("hi")</script><style>body { color: red; }</style><p>Content</p>';
      const markdown = convertHtmlToMarkdown(html);
      expect(markdown).toContain('# Title');
      expect(markdown).toContain('Content');
      expect(markdown).not.toContain('alert("hi")');
      expect(markdown).not.toContain('color: red');
    });
  });
});

describe('LLM Utils', () => {
  describe('estimateTokens', () => {
    it('should estimate tokens for a string', () => {
      const text = 'Hello world';
      const tokens = estimateTokens(text);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBe(2); // "Hello", " world"
    });
  });
});
