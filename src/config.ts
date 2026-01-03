/**
 * Configuration for the WebSum MCP server
 */

export interface Config {
  /** Base URL for the OpenAI-compatible API */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Maximum token count before summarization is triggered */
  maxTokens: number;
  /** Maximum context length supported by the model */
  maxContextLength: number;
}

/**
 * Get configuration from environment variables
 */
export function getConfig(): Config {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "BASE_URL environment variable is required (e.g., http://localhost:8085/v1)"
    );
  }

  const apiKey = process.env.API_KEY || "no-key-required";
  const maxTokens = parseInt(process.env.MAX_TOKENS || "4096", 10);
  const maxContextLength = parseInt(
    process.env.MAX_CONTEXT_LENGTH || "32768",
    10
  );

  return {
    baseUrl,
    apiKey,
    maxTokens,
    maxContextLength,
  };
}
