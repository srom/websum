import dotenv from 'dotenv';
dotenv.config();

export const config = {
  BASE_URL: process.env.BASE_URL || 'http://100.96.79.2:8085/v1',
  API_KEY: process.env.API_KEY || 'no-key-required',
  MAX_TOKENS: parseInt(process.env.MAX_TOKENS || '4096', 10),
  MAX_CONTEXT_LENGTH: parseInt(process.env.MAX_CONTEXT_LENGTH || '32768', 10),
  MODEL: process.env.MODEL || 'gpt-3.5-turbo', // Default model if not specified
};
