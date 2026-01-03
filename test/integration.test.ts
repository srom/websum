#!/usr/bin/env node
/**
 * Integration test for WebSum MCP server
 * Tests the fetch_url tool with actual API calls
 */

import { fetchUrl } from "../src/tools/fetchUrl.js";
import type { Config } from "../src/config.js";

const TEST_CONFIG: Config = {
  baseUrl: "http://100.96.79.2:8085/v1",
  apiKey: "no-key-required",
  maxTokens: 4096,
  maxContextLength: 32768,
};

async function testFetchUrl() {
  console.log("Testing fetch_url with a real webpage...\n");

  try {
    // Test 1: Fetch a small webpage (should not need summarization)
    console.log("Test 1: Fetching https://example.com (should not summarize)");
    const result1 = await fetchUrl("https://example.com", undefined, {
      ...TEST_CONFIG,
      maxTokens: 10000, // High limit to avoid summarization
    });
    console.log("✓ Successfully fetched example.com");
    console.log(`Result length: ${result1.length} characters\n`);

    // Test 2: Fetch with context
    console.log(
      "Test 2: Fetching with context (Wikipedia Node.js page, limited tokens)"
    );
    const result2 = await fetchUrl(
      "https://en.wikipedia.org/wiki/Node.js",
      "Information about Node.js history and features",
      {
        ...TEST_CONFIG,
        maxTokens: 500, // Low limit to trigger summarization
      }
    );
    console.log("✓ Successfully fetched and summarized Wikipedia page");
    console.log(`Summary length: ${result2.length} characters`);
    console.log(`Summary preview:\n${result2.substring(0, 200)}...\n`);

    console.log("All tests passed! ✓");
  } catch (error) {
    console.error("✗ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testFetchUrl();
