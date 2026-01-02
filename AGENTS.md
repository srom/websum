What follows is a description of the task at hand. **This is the most important part of the instruction set!**

# websum: an MCP server for fetching and summarising the content of web pages
You are tasked with building websum (short for web summarizer), an MCP server written in TypeScript.

IMPORTANT! If you do not know what an MCP is, read: https://modelcontextprotocol.io/docs/getting-started/intro then look up further information by firing a web search.

## Tool: fetch_url
This MCP server implements a single tool: `fetch_url`. This tool fetches a webpage, turns its content into markdown and optionally summarizes it if the content is larger than a given value (the value itself is a setting, MAX_TOKENS, defaulting to 4096 tokens). Summarization is provided by an extenral model. This model can be accessed via an API endpoint. We only need to support OpenAI-compatible endpoints via `/v1/chat/completions`. The model base URL and API key will be provided in the config.

The tool `fetch_url` accepts two parameters:
- `url`: mandatory string parameter. The url pointing to the web content that will be downloaded, turned into markdown and summarized.
- `context`: optional string parameter. Provides a short description about what knowledge the model is looking to gather from the content of this URL. If provided, the text will be used to help with summarization.

## Workflow of the fetch_url tool
- download the content of a URL
- convert content to markdown
- check its size in term of LLM tokens
- if size bigger than MAX_TOKENS, 
    - send content to summarizer with a suitable prompt (see below). 
    - return summarized content.
- else
    - return content.

In other words the main components to be built are:
- a way to fetch a URL
- a way to estimate the number of LLM tokens (look up a solution online. this has been done before)
- a way to call an OpenAI-compatible API through /v1/chat/completions

## Prompt to be sent to the summarizer

Something along those lines:

```md
You are an expert summarizing engine. Summarize the content below down to a MAXIMUM of <MAX_TOKENS> tokens. 

<if parameter context has been provided, add:>Use the following context to guide your summarization: <context></if>

IMPORTANT: outputs your summary ONLY. In markdown format. NOTHING ELSE.

CONTENT:
<web url content in markdown format>
```

In the config, a MAX_CONTEXT_LENGTH will be specified. Make sure the prompt + context + content does not exceed this context dize.

## Inspiration
You may draw inspiration from the way software opencode fetches URL with its `webfetch` tool: https://raw.githubusercontent.com/anomalyco/opencode/refs/heads/dev/packages/opencode/src/tool/webfetch.ts

You may also draw inspiration from other MCP tools, such as this MCP server for searxng which I frequently use: https://github.com/ihor-sokoliuk/mcp-searxng

## Testing
Write thorough unit tests and make sure they all pass!
Write integration tests using the below credentials.

## Test credentials
You may use the following credentials to access an OpenAI-compatible summarization endpoint:
```sh
BASE_URL='http://100.96.79.2:8080/v1'
API_KEY='no-key-required'
MAX_CONTEXT_LENGTH=32768
```

## Installation
Should support:
- docker
- npx
- npm

Do not attempt to register the package with npm or npx. I will do so later. The codebase only need to be ready to support these package managers.

The project should also be ready to be register with the MCP registry glama.ai (but do not attempt to register it yourself).

## Example use case
This tool will be used as an MCP endpoint within coding harness software like opencode or Claude code.

Here is an example opencode.json config stub (using a fictitious package for now):

```json
(...rest of the config)
  "mcp": {
    "websum": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "websum-mcp"
      ],
      "environment": {
        "BASE_URL": "http://{env:HOME_SERVER_IP}:8080"
      },
      "enabled": true
    }
  }
(...rest of the config)
```

## Environment

You are running within a docker container running Debian slim. The working directory has been mounted to /app.
Node is already installed, as well as a few core packages. YOu have root access. You may install any packages you see fit to help you carry out your task from start to finish.

## Closing words
- Use standard TypeScript style and best practices.
- Don't forget to write a concise README.md file.
- Ignore content in folder .opencode-sandbox
- MAKE SURE EVERYTHING WORKS BEFORE STOPPING!
