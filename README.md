# websum MCP Server

An MCP server that fetches a webpage, converts its content to markdown, and optionally summarizes it.

## Features

- **fetch_url Tool**: 
    - Fetches content from a URL.
    - Converts HTML to Markdown.
    - Summarizes content if it exceeds `MAX_TOKENS`.
    - Supports OpenAI-compatible API endpoints for summarization.

## Configuration

The server can be configured using the following environment variables:

- `BASE_URL`: The base URL for the OpenAI-compatible API (default: `http://100.96.79.2:8085/v1`).
- `API_KEY`: The API key for the summarization service (default: `no-key-required`).
- `MAX_TOKENS`: Maximum number of tokens before summarization is triggered (default: `4096`).
- `MAX_CONTEXT_LENGTH`: Maximum context length for the LLM (default: `32768`).
- `MODEL`: The model name to use for summarization (default: `gpt-3.5-turbo`).

## Installation

### Using npx

```bash
npx -y websum-mcp
```

### Using Docker

```bash
docker build -t websum-mcp .
docker run -i --rm websum-mcp
```

## Usage in MCP Clients (e.g., Claude Code, opencode)

Example configuration stub:

```json
{
  "mcpServers": {
    "websum": {
      "command": "npx",
      "args": ["-y", "websum-mcp"],
      "env": {
        "BASE_URL": "http://your-api-url/v1",
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm test
```

3. Build:
```bash
npm run build
```
