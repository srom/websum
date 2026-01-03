import { encode } from "gpt-tokenizer";
import type { Config } from "../config.js";

interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model?: string;
  messages: ChatCompletionMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Summarizes content using an OpenAI-compatible API
 */
export async function summarizeContent(
  content: string,
  context: string | undefined,
  config: Config
): Promise<string> {
  // Build the prompt
  let prompt = `You are an expert summarizing engine. Summarize the content below down to a MAXIMUM of ${config.maxTokens} tokens.\n\n`;

  if (context) {
    prompt += `Use the following context to guide your summarization: ${context}\n\n`;
  }

  prompt +=
    "IMPORTANT: output your summary ONLY. In markdown format. NOTHING ELSE.\n\n";
  prompt += `CONTENT:\n${content}`;

  // Ensure the entire request fits within context length
  const promptTokens = encode(prompt);
  const totalTokensNeeded = promptTokens.length + config.maxTokens;

  if (totalTokensNeeded > config.maxContextLength) {
    // Truncate content to fit
    const maxContentTokens =
      config.maxContextLength - config.maxTokens - 200; // Reserve 200 tokens for the prompt template
    const contentTokens = encode(content);
    const truncatedTokens = contentTokens.slice(0, maxContentTokens);

    // Decode back to text (this is a simplification; gpt-tokenizer might not have a decode function)
    // For now, we'll just truncate the string roughly
    const truncatedContent = content.substring(
      0,
      Math.floor((maxContentTokens / contentTokens.length) * content.length)
    );

    console.error(
      `Warning: Content truncated from ${contentTokens.length} to ~${maxContentTokens} tokens to fit within context length`
    );

    // Rebuild prompt with truncated content
    prompt = `You are an expert summarizing engine. Summarize the content below down to a MAXIMUM of ${config.maxTokens} tokens.\n\n`;
    if (context) {
      prompt += `Use the following context to guide your summarization: ${context}\n\n`;
    }
    prompt +=
      "IMPORTANT: output your summary ONLY. In markdown format. NOTHING ELSE.\n\n";
    prompt += `CONTENT (truncated):\n${truncatedContent}`;
  }

  // Call the OpenAI-compatible API
  const response = await fetch(
    `${config.baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: config.maxTokens,
        temperature: 0.3,
      } as ChatCompletionRequest),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Summarization API request failed with status ${response.status}: ${errorText}`
    );
  }

  const data = (await response.json()) as ChatCompletionResponse;

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from summarization API");
  }

  return data.choices[0].message.content;
}
