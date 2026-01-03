import axios from 'axios';
import { fetchAndConvert } from './fetcher.js';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetcher', () => {
  it('should fetch HTML and convert to markdown', async () => {
    mockedAxios.get.mockResolvedValue({
      headers: { 'content-type': 'text/html; charset=utf-8' },
      data: '<h1>Hello World</h1><p>This is a test.</p>'
    });

    const markdown = await fetchAndConvert('http://example.com');
    expect(markdown).toContain('# Hello World');
    expect(markdown).toContain('This is a test.');
  });

  it('should return raw text if content type is not HTML', async () => {
    mockedAxios.get.mockResolvedValue({
      headers: { 'content-type': 'text/plain' },
      data: 'Just some text'
    });

    const result = await fetchAndConvert('http://example.com/text');
    expect(result).toBe('Just some text');
  });

  it('should handle errors', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    // Since axios.isAxiosError might not work with the mock directly if not setup perfectly, 
    // we can check if it throws generic error. 
    // But fetcher implementation checks isAxiosError. 
    // We can simulate an axios error structure if needed, or just generic error.
    
    await expect(fetchAndConvert('http://example.com')).rejects.toThrow();
  });
});
