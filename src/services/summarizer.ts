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
  // Add some margin to account for tokenizer mismatch
  // Formula: (MaxContext * (1 - Margin)) - StaticOverhead
  const safetyMarginPercent = 0.02
  const safeContextLimit = Math.floor(config.maxContextLength * (1 - safetyMarginPercent));
  const maxContentTokens = safeContextLimit - staticTokens;

  let contentToSummarize = content;
  
  if (tokenCount > maxContentTokens) {
      console.error(`Content length (${tokenCount}) + prompt overhead (${staticTokens}) exceeds max context length (${maxContentTokens}). Truncating content.`);
      if (maxContentTokens > 0) {
        contentToSummarize = decode(tokens.slice(0, maxContentTokens));
      } else {
        // Edge case: instructions are larger than the context window allowed.
        throw new Error(`Context length (${maxContentTokens}) too small to even fit the prompt instructions (${staticTokens}).`);
      }
  }

  return callSummarizer(contentToSummarize, context);
}

function buildPrompt(content: string, context?: string): string {
  // Define core task
  let prompt = (
    `You are a High-Fidelity Snippet Extractor. ` +
    `Your task is to read a web page dump in markdown format and output a clean list of relevant excerpts.\n` +
    `You must act as a precise filter: discarding noise while preserving the original phrasing of signal.\n\n`
  );

  // Rules of engagement
  prompt += (
    `### RULES:\n` +
    `- **VERBATIM ONLY:** Do not rewrite, summarize, or fix grammar. Copy-paste exactly.\n` +
    `- **NO WEB NOISE:** Aggressively remove navigation menus, footer links, "sign up" forms, "related articles," and cookie warnings.\n` +
    `- **FACTUAL**: Keep as many technical details as possible (such as code snippets) if relevant to the subject at hand.` +
    `- **DENSITY:** Prefer extracting whole paragraphs over fragmented sentences.` +
    `- **LENGTH:** Keep it short.\n\n`
  );

  // Context
  if (!context) {
    context = (
      `Identify the core subject matter. ` +
      `Extract the introduction, main technical details, arguments, and conclusions. ` +
      `Ignore generic filler.`
    );
  }
  prompt += (
    `### FOCUS CONTEXT:\n` +
    `The user is specifically looking for information matching this description:\n` +
    `"${context}"\n\n`
  );

  // Document
  prompt += (
    `### SOURCE DOCUMENT:\n` +
    `<DOCUMENT_START>\n` + 
    `${content}\n` + 
    `<DOCUMENT_END>\n\n`
  );

  // Final trigger
  prompt += (
    `Based on the FOCUS CONTEXT, generate the list of verbatim excerpts from the SOURCE DOCUMENT now.\n` +
    `Output:`
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
            // Limit number of output tokens.
            max_tokens: config.maxTokens,
            // Set temperature to 0 to prevent hallucinations.
            temperature: 0,
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
