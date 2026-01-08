# websum-mcp

An MCP server for fetching the content of web pages as markdown and optionally summarizing it by asking an LLM to extract relevant snippets to reduce the token footprint.

Use case: use as a web fetching tool for local LLMs with limited context size. Can be used as a drop-in replacement for the webfetch tool in Claude code or opencode (or other coding TUIs).

## Features

- Fetch web pages via URL.
- Convert HTML content to Markdown.
- Summarize content using your LLM of choice when content size exceeds a configurable limit.
  - Supports any OpenAI-compatible API.

Prompt being sent ot the summarizing LLM (as defined in [src/services/summarizer.ts](src/services/summarizer.ts)):

```md
You are a High-Fidelity Snippet Extractor. Your task is to read a web page dump in markdown format and output a handful of relevant excerpts. You must act as a precise filter: discarding noise while preserving key signal from the original document.

### RULES:
- **VERBATIM ONLY**: Do not rewrite, summarize, or fix grammar. Copy-paste exactly. No greetings, commentary, meta-text or reasoning in output.
- **NO WEB NOISE**: Aggressively remove navigation menus, footer links, "sign up" forms, "related articles", cookie warnings, etc.
- **FACTUAL**: Keep as many technical details as possible (such as code snippets) if relevant to the subject at hand.
- Prefer extracting whole paragraphs over fragmented sentences.
- Keep it short and to the point.

### FOCUS CONTEXT: 
The user is specifically looking for information matching this description: "(user-provided context)"

### SOURCE DOCUMENT:
<DOCUMENT_START>
(requested url content in markdown format)
<DOCUMENT_END>

Based on the FOCUS CONTEXT, generate the list of verbatim excerpts from the SOURCE DOCUMENT now.
Output:
``` 

## Tools

### `fetch_url`

Fetch a webpage, convert to markdown, and summarize if necessary.

**Parameters:**
- `url` (string, required): The URL to fetch.
- `context` (string, optional): The specific information you need from the page to ensure a relevant summary.

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
- `MAX_PAYLOAD_SIZE`: Maximum size of the the HTTP response content allowed in MB (default: `10`) 
- `USER_AGENT` (defaults to a sensible value)

## Example outputs

Open-weight model `gpt-oss-20b` performs surprinsingly well. I am using [Unsloth's F16 version](https://huggingface.co/unsloth/gpt-oss-20b-GGUF) running on llama.cpp with `temperature = 0` and `reasoning: low` (and otherwise [recommended paramaters](https://unsloth.ai/docs/models/gpt-oss-how-to-run-and-fine-tune#recommended-settings)).

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
