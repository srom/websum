# websum-mcp

**Websum** is an MCP (Model Context Protocol) server written in TypeScript that provides a single tool `fetch_url`. The tool fetches a web page, converts the HTML to markdown and, when the content exceeds a configurable token limit, summarises it by calling an external OpenAI‑compatible LLM endpoint.

## Features
- Fetch any HTTP/HTTPS URL and return markdown.
- Token‑aware: uses a simple 4‑characters‑per‑token heuristic (fallback to the `js‑tiktoken` encoder when available).
- Automatic summarisation via a configurable `/v1/chat/completions` endpoint when the content would exceed `MAX_TOKENS` (default 4096).
- Fully MCP‑compatible – registers the tool with the Model Context Protocol SDK and runs over stdio (ideal for `opencode` or Claude). 
- Configurable via environment variables:
  - `BASE_URL` – base URL of the LLM API (e.g. `http://host:8085/v1`).
  - `API_KEY` – Bearer token for the LLM API (optional).
  - `MAX_TOKENS` – maximum token count before summarisation (default `4096`).
  - `MAX_CONTEXT_LENGTH` – maximum combined length of prompt + context + content (default `32768`).
  - `MODEL` – model name used for the summarisation request (default `gpt-3.5-turbo`).

## Installation
```sh
npm install   # install dependencies
npm run build # compile TypeScript to ./dist
```
You can also run the server directly with `npx` after publishing the package.

## Running the server
```sh
BASE_URL='http://localhost:8085/v1' \
API_KEY='my‑api‑key' \
MAX_TOKENS=4096 \
MODEL='gpt-3.5-turbo' \
node dist/index.js
```
The server will listen on stdin/stdout and can be used as an MCP tool.

## Development
- **Tests** are written with Jest and can be run via `npm test`.
- To add more tools, register them on the `McpServer` instance using `server.registerTool`.

## License
MIT
