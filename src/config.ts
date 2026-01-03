export const config = {
  baseUrl: process.env.BASE_URL || 'http://100.96.79.2:8085/v1',
  apiKey: process.env.API_KEY || 'no-key-required',
  maxTokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
  maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH || '32768', 10),
};
