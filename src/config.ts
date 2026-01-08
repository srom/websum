const defaultUserAgent = (
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/120.0.0.0 ' +
  'Safari/537.36'
)

export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:8080/v1',
  apiKey: process.env.API_KEY || 'no-key-required',
  modelName: process.env.MODEL_NAME || 'gpt-oss-20b',
  maxTokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
  maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH || '131072', 10),
  userAgent: process.env.USER_AGENT || defaultUserAgent,
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '10', 10),   // in seconds
  summarizerTimeout: parseInt(process.env.SUMMARIZER_TIMEOUT || '600', 10),  // in seconds
};
