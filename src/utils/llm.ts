import { getEncoding } from 'js-tiktoken';
import axios from 'axios';
import { config } from './config.js';

const encoding = getEncoding('cl100k_base');

export function estimateTokens(text: string): number {
  return encoding.encode(text).length;
}

export async function summarize(content: string, maxTokens: number, context?: string): Promise<string> {
  const prompt = buildPrompt(content, maxTokens, context);
  
  // Ensure the prompt doesn't exceed MAX_CONTEXT_LENGTH
  const promptTokens = estimateTokens(prompt);
  if (promptTokens > config.MAX_CONTEXT_LENGTH) {
    // If even with a trimmed content it's too long, we might need to truncate content further
    // But for now let's assume content passed here is already somewhat reasonable or we truncate it
    // Truncate content to fit in context length
    const overhead = promptTokens - estimateTokens(content);
    const allowedContentTokens = config.MAX_CONTEXT_LENGTH - overhead - 100; // safety margin
    if (allowedContentTokens > 0) {
      const tokens = encoding.encode(content);
      const truncatedContent = encoding.decode(tokens.slice(0, allowedContentTokens));
      return summarize(truncatedContent, maxTokens, context);
    }
  }

  try {
    const response = await axios.post(`${config.BASE_URL}/chat/completions`, {
      model: config.MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
    }, {
      headers: {
        'Authorization': `Bearer ${config.API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('Error calling summarizer:', error.response?.data || error.message);
    throw new Error(`Summarization failed: ${error.message}`);
  }
}

function buildPrompt(content: string, maxTokens: number, context?: string): string {
  let prompt = `You are an expert summarizing engine. Summarize the content below down to a MAXIMUM of ${maxTokens} tokens.\n\n`;
  
  if (context) {
    prompt += `Use the following context to guide your summarization: ${context}\n\n`;
  }
  
  prompt += `IMPORTANT: outputs your summary ONLY. In markdown format. NOTHING ELSE.\n\n`;
  prompt += `CONTENT:\n${content}`;
  
  return prompt;
}
