# websum-mcp

An MCP server for fetching and summarising the content of web pages.

## Features

- Fetches web pages via URL.
- Converts HTML content to Markdown.
- Summarizes content using an OpenAI-compatible API if it exceeds a configurable token limit.

## Tools

### `fetch_url`

Fetches a webpage, turns its content into markdown and optionally summarizes it.

**Parameters:**
- `url` (string, required): The URL to fetch.
- `context` (string, optional): A short description about what knowledge to gather, used to guide summarization.

## Configuration

The server is configured via environment variables:

- `BASE_URL`: The base URL of the OpenAI-compatible API (default: `http://localhost:8080/v1`)
- `API_KEY`: The API key for the API (default: `no-key-required`)
- `MODEL_NAME`: The name of the summarization model (default: `gemma-3-1b`)
- `MAX_TOKENS`: The maximum number of tokens allowed before summarization is triggered (default: `4096`)
- `MAX_CONTEXT_LENGTH`: The maximum context length for the summarization model (default: `32768`)

## Installation & Usage

### Docker

```sh
docker build -t websum-mcp .
docker run -i websum-mcp
```

### NPX

```sh
npx websum-mcp
```

(Note: Ensure the package is available or installed locally/globally)

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
