
import { jest, describe, it, expect } from '@jest/globals';

// Set env vars before imports

process.env.BASE_URL = 'http://100.96.79.2:8085/v1';
process.env.API_KEY = 'no-key-required';
process.env.MAX_CONTEXT_LENGTH = '32768';

import { fetchAndConvert } from '../src/services/fetcher.js';
import { summarizeIfNeeded } from '../src/services/summarizer.js';
import { config } from '../src/config.js';

describe('Integration Test', () => {
    // Increase timeout for integration tests
    jest.setTimeout(60000); // 60s

    it('should fetch example.com and not summarize if token limit is high', async () => {
        // Default MAX_TOKENS is 4096
        const url = 'http://example.com';
        const markdown = await fetchAndConvert(url);
        expect(markdown).toContain('Example Domain');
        
        const summary = await summarizeIfNeeded(markdown);
        // Should be same as markdown since it's small
        expect(summary).toBe(markdown);
    });

    it('should fetch and summarize if token limit is low', async () => {
        const originalMaxTokens = config.maxTokens;
        config.maxTokens = 10; // Force summarization. Example.com is > 10 tokens.

        try {
            const url = 'http://example.com';
            const markdown = await fetchAndConvert(url);
            
            console.log("Markdown length:", markdown.length);
            
            const summary = await summarizeIfNeeded(markdown, "Focus on the purpose of the domain");
            console.log("Summary:", summary);
            
            expect(summary).not.toBe(markdown);
            // The summary should differ from content
        } finally {
            config.maxTokens = originalMaxTokens;
        }
    });
});
