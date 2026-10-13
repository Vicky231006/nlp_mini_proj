# NC Tutoring Prototype

A browser-based tutoring workflow with a persistent chat UI, a server-side Gemini integration, a swappable OpenAI-compatible model provider, and a retriever interface for adding RAG.

## Requirements

- Node.js 22 or newer
- A Gemini API key for the Gemini provider, or an OpenAI-compatible local model server (for example, Ollama with its OpenAI-compatible endpoint)

## Run locally

```sh
npm ci
```

Copy `.env.example` to `.env`, then set `GEMINI_API_KEY` to a key from Google AI Studio. `.env` is git-ignored. The current local setup also accepts the existing `api_key1`, `api_key2`, and `api_key3` variables, and will try each Gemini key in order if a request is rejected or rate-limited.

Start the Vite UI and API server together:

```sh
npm run dev
```

Open the URL printed by Vite. The API runs locally on port 3001 and is proxied by Vite. Check the implementation with:

```sh
npm test
npm run lint
npm run build
```

For production, build and start the bundled static site and API server:

```sh
npm run build
npm start
```

The server listens on `127.0.0.1:3001` by default. Set `PORT` or `HOST` if your deployment requires a different binding; use an HTTPS reverse proxy when exposing it outside the machine.

## Choose a model provider

Gemini is the default:

```dotenv
CHAT_PROVIDER=gemini
GEMINI_API_KEY=your-server-side-key
GEMINI_MODEL=gemini-3.1-flash-lite
```

For key fallback, use a comma-separated `GEMINI_API_KEYS` instead of `GEMINI_API_KEY`.

To connect a local server that implements the OpenAI chat-completions API:

```dotenv
CHAT_PROVIDER=openai-compatible
LOCAL_MODEL_BASE_URL=http://127.0.0.1:11434/v1
LOCAL_MODEL_NAME=llama3.2
LOCAL_MODEL_API_KEY=
```

The server never sends a Gemini key to the browser. Local-provider credentials, if any, are also read only by the server. Both providers receive the same conversation history and retrieved-context instructions.

## Conversation and RAG architecture

- The chat UI stores up to 50 conversations in browser `localStorage`, with up to 100 displayed turns per conversation. History is local to that browser and is not synchronized between devices.
- Each follow-up sends the most recent 40 user/assistant messages, so the model has the conversation context. Start a new chat to begin without that context.
- `POST /api/chat` validates and bounds the conversation payload. `GET /api/health` reports the selected provider and whether its required configuration is present.
- `server/providers/gemini.js` and `server/providers/openAICompatible.js` implement the same `generate({ messages, systemInstruction })` interface. Add another provider by implementing this interface and selecting it in `server/app.js`.
- `server/retriever.js` is the RAG extension point. Replace its empty `retrieveContext({ query, messages })` implementation with your vector/database search and return documents shaped like `{ title, content, url? }`. The shared chat service adds those documents to the model context and returns their source titles/URLs as citations.

The retriever is intentionally not a fake knowledge base: until it is connected, the tutor is instructed not to claim that its answer is grounded in textbooks or other sources. Keep provider and vector-store credentials server-side. Chat content is sent to the selected model provider; use only data you are authorized to send.

## Current demo screens

Onboarding, content ingestion, and analytics are frontend demonstrations with example data. The repeated puzzle does not assess or score a learner, file selection does not upload or process content, and sample analytics are not real learner records. Do not enter sensitive personal information or use these demo screens for educational, clinical, placement, or other high-stakes decisions.
