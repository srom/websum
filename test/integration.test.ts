
import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import { encode, decode } from 'gpt-3-encoder';

// Set env vars before imports
process.env.API_KEY = 'no-key-required';
process.env.MAX_CONTEXT_LENGTH = '32768';
// BASE_URL will be set dynamically

import { fetchAndConvert } from '../src/services/fetcher.js';
import { summarizeIfNeeded } from '../src/services/summarizer.js';
import { config } from '../src/config.js';

describe('Integration Test', () => {
    // Increase timeout for integration tests
    jest.setTimeout(60000); // 60s

    let server: Server;
    let port: number;

    beforeAll((done) => {
        const app = express();
        app.use(bodyParser.json());

        app.post('/v1/chat/completions', (req, res) => {
            try {
                const messages = req.body.messages;
                if (!messages || messages.length === 0) {
                     res.status(400).send("No messages provided");
                     return;
                }
                const prompt = messages[messages.length - 1].content;
                
                // Extract max tokens from prompt
                // Pattern: "MAXIMUM of <number> tokens"
                const maxTokensMatch = prompt.match(/MAXIMUM of (\d+) tokens/);
                const maxTokens = maxTokensMatch ? parseInt(maxTokensMatch[1], 10) : 100;

                // Extract content
                const contentMatch = prompt.split('CONTENT:\n');
                let content = "";
                if (contentMatch.length > 1) {
                    content = contentMatch[1];
                } else {
                    // Fallback if split fails? But format should be consistent.
                    content = prompt; 
                }

                // Truncate
                const tokens = encode(content);
                const truncatedTokens = tokens.slice(0, maxTokens);
                const summary = decode(truncatedTokens);

                res.json({
                    choices: [
                        {
                            message: {
                                content: summary
                            }
                        }
                    ]
                });
            } catch (error) {
                console.error("Error in mock server:", error);
                res.status(500).send("Internal Server Error");
            }
        });

        server = app.listen(0, () => {
            const addr = server.address();
            if (addr && typeof addr !== 'string') {
                port = addr.port;
                process.env.BASE_URL = `http://localhost:${port}/v1`;
                // Update config object
                config.baseUrl = `http://localhost:${port}/v1`;
                console.log(`Mock server running at ${config.baseUrl}`);
            }
            done();
        });
    });

    afterAll((done) => {
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });

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
            // The summary should be approximately 10 tokens.
            const summaryTokens = encode(summary);
            // It might be slightly less or equal
            expect(summaryTokens.length).toBeLessThanOrEqual(10);
            
        } finally {
            config.maxTokens = originalMaxTokens;
        }
    });
});
