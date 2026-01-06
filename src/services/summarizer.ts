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
  let prompt = (
    `You are a Precision Snippet Extractor. ` +
    `Your goal is to identify and retrieve the most relevant segments of text from the provided document. ` +
    `Limit your output to a maximum of about ${config.maxTokens} tokens.\n\n`
  );
  prompt = (
    `For instance, if content relates to a python package, ` + 
    `key information include code examples and associated explanations.\n\n`
  )
  if (!context) {
    context = (
      `Extract the most information-dense passages that define the primary subject matter. ` + 
      `Remove all fluff and redundant phrasing.`
    );
  }
  prompt += (
    `Use the following user-provided context to guide your selection: ` +
    `<CONTEXT_START>${context}</CONTEXT_END>\n\n`
  );
  prompt += (
    `<DOCUMENT_START>\n${content}\n<DOCUMENT_END>\n\n`
  );
  prompt += (
    `IMPORTANT: You must maintain the absolute integrity of the source text; ` +
    `do not paraphrase, edit, or add external information. ` + 
    `Output only the original, verbatim snippets that directly address the core context. ` +
    `NO COMMENTARY.\n\n` +
    `OUTPUT:`
  );
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
            },
            timeout: config.summarizerTimeout * 1000,
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
