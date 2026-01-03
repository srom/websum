# WebSum MCP Server

A Model Context Protocol (MCP) server for fetching and intelligently summarizing web content. Built with TypeScript, this server fetches webpages, converts them to markdown, and automatically summarizes content that exceeds a specified token limit using an OpenAI-compatible API.

## Features

- 🌐 **URL Fetching**: Downloads web content with proper user agents and headers
- 📝 **Markdown Conversion**: Converts HTML content to clean, readable markdown
- 🤖 **Smart Summarization**: Automatically summarizes content exceeding token limits
- ⚡ **Token Counting**: Uses GPT tokenizer for accurate token estimation
- 🔧 **OpenAI-Compatible**: Works with any OpenAI-compatible API endpoint
- 🐳 **Docker Support**: Easy deployment with Docker
- 📦 **NPM/NPX Ready**: Install and run via npm or npx

## How It Works

1. **Fetch**: Downloads content from the specified URL
2. **Convert**: Transforms HTML to markdown format
3. **Count**: Estimates token count using GPT tokenizer
4. **Summarize** (if needed): If content exceeds `MAX_TOKENS`, sends to summarization API
5. **Return**: Provides markdown content or summary to the LLM

## Installation

### Via NPX (Recommended)

```bash
npx websum-mcp
```

### Via NPM

```bash
npm install -g websum-mcp
websum-mcp
```

### Via Docker

```bash
docker build -t websum-mcp .
docker run -i --rm \
  -e BASE_URL="http://100.96.79.2:8085/v1" \
  -e API_KEY="no-key-required" \
  websum-mcp
```

### From Source

```bash
git clone <repository-url>
cd websum-mcp
npm install
npm run build
node build/index.js
```

## Configuration

The server is configured via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BASE_URL` | Yes | - | OpenAI-compatible API base URL (e.g., `http://localhost:8085/v1`) |
| `API_KEY` | No | `"no-key-required"` | API key for authentication |
| `MAX_TOKENS` | No | `4096` | Maximum tokens before summarization triggers |
| `MAX_CONTEXT_LENGTH` | No | `32768` | Maximum context length supported by the model |

### Example Configuration

```bash
export BASE_URL='http://100.96.79.2:8085/v1'
export API_KEY='no-key-required'
export MAX_TOKENS=4096
export MAX_CONTEXT_LENGTH=32768
```

## MCP Integration

### OpenCode Configuration

Add to your `opencode.json`:

```json
{
  "mcp": {
    "websum": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "websum-mcp"
      ],
      "environment": {
        "BASE_URL": "http://{env:HOME_SERVER_IP}:8085/v1",
        "API_KEY": "no-key-required",
        "MAX_TOKENS": "4096",
        "MAX_CONTEXT_LENGTH": "32768"
      },
      "enabled": true
    }
  }
}
```

### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "websum": {
      "command": "npx",
      "args": ["-y", "websum-mcp"],
      "env": {
        "BASE_URL": "http://100.96.79.2:8085/v1",
        "API_KEY": "no-key-required"
      }
    }
  }
}
```

## MCP Tool: fetch_url

The server provides a single MCP tool called `fetch_url`.

### Parameters

- `url` (required): The URL to fetch and process
- `context` (optional): Guidance for summarization - describes what knowledge you're seeking

### Example Usage

```typescript
// Fetch without context (returns full content if under token limit)
fetch_url({ url: "https://example.com" })

// Fetch with context (helps guide summarization)
fetch_url({ 
  url: "https://en.wikipedia.org/wiki/TypeScript",
  context: "Information about TypeScript's type system features"
})
```

## Summarization Prompt

When content exceeds the token limit, the following prompt is sent to the API:

```
You are an expert summarizing engine. Summarize the content below down to a MAXIMUM of <MAX_TOKENS> tokens.

[If context provided:]
Use the following context to guide your summarization: <context>

IMPORTANT: output your summary ONLY. In markdown format. NOTHING ELSE.

CONTENT:
<web url content in markdown format>
```

## Development

### Build

```bash
npm run build
```

### Run in Development Mode

```bash
npm run dev
```

### Run Tests

```bash
# Unit tests
npm test

# Integration test (requires test API)
npm run test:integration
```

### Project Structure

```
websum-mcp/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── config.ts          # Configuration management
│   ├── tools/
│   │   ├── fetchUrl.ts    # URL fetching and processing
│   │   └── summarizer.ts  # Content summarization
│   └── __tests__/         # Unit tests
├── test/
│   └── integration.test.ts # Integration tests
├── build/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## Testing with Test Credentials

You can test the server using the provided test credentials:

```bash
export BASE_URL='http://100.96.79.2:8085/v1'
export API_KEY='no-key-required'
export MAX_CONTEXT_LENGTH=32768

# Run integration test
npm run test:integration
```

## Technical Details

### Dependencies

- `@modelcontextprotocol/sdk`: Official MCP SDK for TypeScript
- `gpt-tokenizer`: Accurate token counting for LLMs
- `turndown`: HTML to Markdown conversion
- `zod`: Runtime type validation

### Token Counting

The server uses `gpt-tokenizer` to accurately estimate token counts, ensuring content is properly sized before sending to the summarization API.

### Content Processing

1. HTML content is cleaned and converted to markdown using Turndown
2. Script, style, and metadata tags are removed
3. Content is formatted with consistent markdown syntax

### Error Handling

- Invalid URLs are rejected
- Response size is limited to 5MB
- Network timeouts after 30 seconds
- API errors are properly propagated

## Use Cases

- **Research**: Fetch and summarize academic papers or articles
- **Documentation**: Extract and condense technical documentation
- **News**: Get summaries of news articles
- **Web Scraping**: Convert web content to LLM-friendly format

## Limitations

- Maximum response size: 5MB
- Request timeout: 30 seconds
- Requires OpenAI-compatible API for summarization
- Markdown conversion quality depends on HTML structure

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Built with the [Model Context Protocol](https://modelcontextprotocol.io/)
- Inspired by [opencode's webfetch tool](https://github.com/anomalyco/opencode)
- Uses patterns from [mcp-searxng](https://github.com/ihor-sokoliuk/mcp-searxng)
