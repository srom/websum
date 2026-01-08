# websum-mcp

An MCP server for fetching the content of web pages as markdown and optionally extracting relevant snippets (a.k.a ["Extraction-based summarization"](https://en.wikipedia.org/wiki/Automatic_summarization#Extraction-based_summarization)) to reduce the token footprint. 

Main usecase: use as a web fetching tool for local LLMs with limited context size. Can be used as a drop-in replacement for the webfetch tool in Claude code or opencode (or other coding TUIs).

## Features

- Fetch web pages via URL.
- Convert HTML content to Markdown.
- Summarize content using your LLM of choice when content size exceeds a configurable limit.
  - Supports any OpenAI-compatible API.

Excerpt from the prompt being sent ot the summarizing LLM:

```md
You are a Precision Snippet Extractor.
Your goal is to identify and retrieve the most relevant segments of text from the provided document.
(...)
```

Full prompt available [HERE](src/services/summarizer.ts). 

## Tools

### `fetch_url`

Fetch a webpage, convert to markdown, and summarize if necessary.

**Parameters:**
- `url` (string, required): The URL to fetch.
- `context` (string, optional): The specific information you need from the page to ensure a relevant summary.

## Example outputs

- Example 1:
  - URL: https://docs.pytorch.org/docs/stable/distributions.html
  - Context: "pytorch lognormal distribution"
  - [View output from example 1](examples/example1.md)

- Example 2:
  - URL: https://github.com/ggerganov/llama.cpp
  - Context: "Extract supported model formats, hardware requirements, and basic usage example."
  - [View ouput from example 2](examples/example2.md)

- Example 3:
  - URL: https://lilianweng.github.io/posts/2023-06-23-agent/
  - Context: None.
  - [View output from example 3](examples/example3.md)

## Configuration

The server is configured via environment variables:

Mandatory parameter:
- `BASE_URL`: The base URL of the OpenAI-compatible API.
  - e.g., `https://api.openai.com/v1` or `http://localhost:8080/v1`

Optional parameters:
- `API_KEY`: The key for the API (default: `no-key-required`)
- `MODEL_NAME`: The name of the summarization model (default: `gpt-oss-20b`)
- `MAX_TOKENS`: The maximum number of tokens allowed before summarization is triggered (default: `4096`)
- `MAX_CONTEXT_LENGTH`: The maximum context length for the summarization model (default: `131072`)
- `REQUEST_TIMEOUT`: URL fetching timeout in seconds (default: `10`)
- `SUMMARIZER_TIMEOUT`: Summarizer API timeout in seconds (default: `600`)
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
        "MODEL_NAME": "gpt-oss-20b",
        "MAX_TOKENS": "4096",
        "MAX_CONTEXT_LENGTH": "131072"
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
        "MODEL_NAME": "gpt-oss-20b",
        "MAX_TOKENS": "4096",
        "MAX_CONTEXT_LENGTH": "131072"
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
4. Locally test the MCP server:
    ```sh
    npx @modelcontextprotocol/inspector npx -y websum-mcp
    ```
