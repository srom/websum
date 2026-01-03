export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:8080/v1',
  apiKey: process.env.API_KEY || 'no-key-required',
  maxTokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
  maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH || '32768', 10),
};
