import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import axios from 'axios';
import { summarizeIfNeeded } from './summarizer.js';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);


// We need to mock the config module. 
// Since jest mocks are hoisted, we need to define it carefully.
jest.mock('../config.js', () => ({
  config: {
    baseUrl: 'http://mock-api',
    apiKey: 'mock-key',
    maxTokens: 5, // Very small limit
    maxContextLength: 1000
  }
}));

describe('summarizer', () => {
  beforeEach(() => {
    mockedAxios.post.mockClear();
  });

  it('should return content as is if under maxTokens', async () => {
    const content = "Hi"; // 1 token
    const result = await summarizeIfNeeded(content);
    expect(result).toBe(content);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('should summarize if over maxTokens', async () => {
    const content = "This is a longer content that definitely has more than 5 tokens.";
    
    mockedAxios.post.mockResolvedValue({
      data: {
        choices: [{ message: { content: "Summary" } }]
      }
    });

    const result = await summarizeIfNeeded(content);
    expect(result).toBe("Summary");
    
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://mock-api/chat/completions',
      expect.objectContaining({
        messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user' })
        ])
      }),
      expect.anything()
    );
  });
});
