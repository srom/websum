
# Integration Test Update - Jan 4, 2026

Updated `test/integration.test.ts` to spin up a local Express server to mock the OpenAI Chat Completions API.
- The mock server implements a "dumb" summarization strategy (truncation) based on the input prompt.
- The `fetch_url` tool logic still fetches content from the real `http://example.com`.
- The server is correctly shut down in the `afterAll` hook.

Dependencies added (devDependencies):
- express
- @types/express
- body-parser
