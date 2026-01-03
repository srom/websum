import { encode, decode } from 'gpt-3-encoder';
import axios from 'axios';
import { config } from '../config.js';

export async function summarizeIfNeeded(content: string, context?: string): Promise<string> {
  const tokens = encode(content);
  const tokenCount = tokens.length;

  if (tokenCount <= config.maxTokens) {
    return content;
  }

  // Need to summarize
  // Check if prompt exceeds context length and truncate content if necessary
  // First, estimate the static part of the prompt
  const staticPrompt = buildPrompt('', context);
  const staticTokens = encode(staticPrompt).length;
  // Calculate how many tokens we can fit for the content
  const maxContentTokens = config.maxContextLength - staticTokens - 100; // Buffer

  let contentToSummarize = content;
  
  if (tokenCount > maxContentTokens) {
      console.error(`Content length (${tokenCount}) + prompt overhead exceeds max context length (${config.maxContextLength}). Truncating content.`);
      if (maxContentTokens > 0) {
        contentToSummarize = decode(tokens.slice(0, maxContentTokens));
      } else {
        throw new Error("Context length too small to even fit the prompt instructions.");
      }
  }

  return callSummarizer(contentToSummarize, context);
}

function buildPrompt(content: string, context?: string): string {
  let prompt = `You are an expert summarizing engine. Summarize the content below down to a MAXIMUM of ${config.maxTokens} tokens.\n\n`;

  prompt += `IMPORTANT: outputs your summary ONLY. NOTHING ELSE!\n\n`;
  
  if (context) {
    prompt += `Use the following context to guide your summarization: ${context}\n\n`;
  }

  prompt += `CONTENT:\n${content}`;
  return prompt;
}

async function callSummarizer(content: string, context?: string): Promise<string> {
    const prompt = buildPrompt(content, context);
    
    try {
        const response = await axios.post(`${config.baseUrl}/chat/completions`, {
            model: config.modelName,
            messages: [
                { role: "user", content: prompt }
            ],
        }, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error("Invalid response from summarizer API");
        }
    } catch (error: any) {
        throw new Error(`Summarization failed: ${error.message}`);
    }
}
