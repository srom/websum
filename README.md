# websum-mcp

An MCP server for fetching and summarising the content of web pages.

## Features

- Fetches web pages via URL.
- Converts HTML content to Markdown.
- Summarizes content using your LLM of choice if content size exceeds a configurable limit.
  - Supports any OpenAI-compatible API.

## Tools

### `fetch_url`

Fetches a webpage, turns its content into markdown and optionally summarizes it.

**Parameters:**
- `url` (string, required): The URL to fetch.
- `context` (string, optional): A short description used to guide summarization.

## Configuration

The server is configured via environment variables:

Mandatory parameter:
- `BASE_URL`: The base URL of the OpenAI-compatible API.
  - e.g., `https://api.openai.com/v1` or `http://localhost:8080/v1`

Optional parameters:
- `API_KEY`: The key for the API (default: `no-key-required`)
- `MODEL_NAME`: The name of the summarization model (default: `gemma-3-1b`)
- `MAX_TOKENS`: The maximum number of tokens allowed before summarization is triggered (default: `4096`)
- `MAX_CONTEXT_LENGTH`: The maximum context length for the summarization model (default: `32768`)
- `REQUEST_TIMEOUT`: URL fetching timeout in seconds (default: `10`)
- `SUMMARIZER_TIMEOUT`: Summarizer API timeout in seconds (default: `120`)
- `USER_AGENT` (defaults to a sensible value)

## Installation & Configuration

This package is available on npm: https://www.npmjs.com/package/websum-mcp

### Claude code config

```json
{
  "mcpServers": {
    "websum": {
      "command": "npx",
      "args": ["-y", "websum-mcp"],
      "env": {
        "BASE_URL": "http://localhost:8080/v1",
        "API_KEY": "no-key-required",
        "MODEL_NAME": "gemma-3-1b",
        "MAX_TOKENS": "4096",
        "MAX_CONTEXT_LENGTH": "32768"
      }
    }
  }
}
```

### opencode config

Add to the `mcp` section your `opencode.json` [config file](https://opencode.ai/docs/config/):

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
        "BASE_URL": "http://localhost:8080/v1",
        "API_KEY": "no-key-required",
        "MODEL_NAME": "gemma-3-1b",
        "MAX_TOKENS": "4096",
        "MAX_CONTEXT_LENGTH": "32768"
      },
      "enabled": true
    }
  }
}
```

### Docker

```sh
docker build -t websum-mcp .
docker run -i websum-mcp
```

## Development

1. Install dependencies:
   ```sh
   npm install
   ```
2. Build:
   ```sh
   npm run build
   ```
3. Run tests:
   ```sh
   npm test
   ```
