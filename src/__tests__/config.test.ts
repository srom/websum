import { describe, it, expect, beforeEach, afterAll, jest } from "@jest/globals";
import { getConfig } from "../config.js";

describe("Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should throw error when BASE_URL is not set", () => {
    delete process.env.BASE_URL;
    expect(() => getConfig()).toThrow(
      "BASE_URL environment variable is required"
    );
  });

  it("should return config with defaults", () => {
    process.env.BASE_URL = "http://localhost:8085/v1";
    const config = getConfig();

    expect(config.baseUrl).toBe("http://localhost:8085/v1");
    expect(config.apiKey).toBe("no-key-required");
    expect(config.maxTokens).toBe(4096);
    expect(config.maxContextLength).toBe(32768);
  });

  it("should use custom values from environment", () => {
    process.env.BASE_URL = "http://example.com/v1";
    process.env.API_KEY = "test-key";
    process.env.MAX_TOKENS = "2048";
    process.env.MAX_CONTEXT_LENGTH = "16384";

    const config = getConfig();

    expect(config.baseUrl).toBe("http://example.com/v1");
    expect(config.apiKey).toBe("test-key");
    expect(config.maxTokens).toBe(2048);
    expect(config.maxContextLength).toBe(16384);
  });
});
