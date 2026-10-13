# Puzzle Lab

A child-friendly visual puzzle and tutoring app. Learners create an account, complete a short reasoning check-in, then chat with a tutor personalized from their saved results. Accounts, assessment results, and chat history are stored in SQLite on the app server. Gemini and Ollama model providers and a RAG extension point are supported.

## Requirements

- Node.js 22 or newer
- A Gemini API key for the Gemini provider, or Ollama for local inference

## Run locally

```sh
npm ci
```

Copy `.env.example` to `.env`, then set `GEMINI_API_KEY` to a key from Google AI Studio, or follow the Ollama setup below to use a local model. `.env` is git-ignored. The current local setup also accepts the existing `api_key1`, `api_key2`, and `api_key3` variables, and will try each Gemini key in order if a request is rejected or rate-limited.

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

## Accounts, assessment, and saved history

- The first screen creates an account or signs in. A new account must complete the 25-puzzle check-in before the tutor is unlocked; returning accounts with saved results go directly to tutoring.
- Passwords are salted and hashed with Node.js `scrypt`. Sessions use random, hashed server-side tokens in `HttpOnly`, `SameSite=Strict` cookies; state-changing requests also require a CSRF token. Sign-up and sign-in attempts are rate-limited.
- The server keeps the answer key private until an assessment is submitted. It checks that answers belong to the active, account-owned puzzle set and calculates all four category counts itself. The tutor receives the saved server-side profile; it does not trust a profile sent by the browser.
- SQLite defaults to `data/accounts.sqlite` (ignored by Git). Set `APP_DATABASE_PATH` to store it elsewhere. Accounts, puzzle results, and conversations are scoped to their owner and sync across devices using the same app server.
- Back up the database with the server stopped, and protect the backup like any other learner data. Do not check it into Git. Keep the deployment behind HTTPS; production cookies require HTTPS.
- There is no email verification, password reset, or self-service account deletion yet. This project is intended for local use or a controlled prototype. Before deploying for children, add appropriate guardian consent, privacy notices, account recovery/deletion, and safeguards required by applicable law. Collect only information you are authorized to store.

## Choose a model provider

Gemini is the default:

```dotenv
CHAT_PROVIDER=gemini
GEMINI_API_KEY=your-server-side-key
GEMINI_MODEL=gemini-3.1-flash-lite
```

For key fallback, use a comma-separated `GEMINI_API_KEYS` instead of `GEMINI_API_KEY`.

To use Qwen2.5-1.5B-Instruct locally with Ollama, install Ollama, download the model, and select it in `.env`:

```powershell
ollama pull qwen2.5:1.5b
```

```dotenv
CHAT_PROVIDER=openai-compatible
LOCAL_MODEL_BASE_URL=http://127.0.0.1:11434/v1
LOCAL_MODEL_NAME=qwen2.5:1.5b
LOCAL_MODEL_API_KEY=
```

Ollama must be running before you send a chat message. Its OpenAI-compatible chat-completions endpoint is used, so the same conversation history and retrieved-context instructions are passed to the model.

To connect a different local server that implements the OpenAI chat-completions API:

```dotenv
CHAT_PROVIDER=openai-compatible
LOCAL_MODEL_BASE_URL=http://127.0.0.1:11434/v1
LOCAL_MODEL_NAME=your-installed-model
LOCAL_MODEL_API_KEY=
```

The server never sends a Gemini key to the browser. Local-provider credentials, if any, are also read only by the server. Both providers receive the same conversation history and retrieved-context instructions.

## Puzzle practice and score interpretation

- The practice flow uses the original 64 visual puzzle items from commit `9ce1d50e080809516f1ae3e09fcb85511eaa85eb`. The server randomly selects 25 different puzzles for each assessment attempt, covering all four designer-assigned categories: Pattern & Alternation, Spatial Transformation, Analogical Mapping, and Multi-Rule Integration.
- Each correct answer counts as one point. The results show the total correct out of 25, answered and skipped counts, and correct counts out of the 6 or 7 sampled puzzles in each category.
- The category labels and counts are descriptive design groupings, not validated or stable measurements of a child's abilities. Results must not be used to rank, diagnose, determine grade standing, or make educational decisions. The tutor receives the raw counts only to choose supportive explanations and must not infer intelligence or label the learner.
- The assessment profile and results are saved to the learner’s account in SQLite. Chat content is sent to the selected model provider as described below.

## Conversation and RAG architecture

- Up to 50 conversations per account and 100 messages per conversation are stored on the app server. History is available after signing in on another device connected to that same server.
- Each follow-up sends the most recent 40 user/assistant messages, so the model has the conversation context. Start a new chat to begin without that context.
- `POST /api/chat` requires a signed-in account with a completed assessment, validates and bounds the conversation payload, and saves successful turns. `GET /api/health` reports the selected provider and whether its required configuration is present.
- `server/providers/gemini.js` and `server/providers/openAICompatible.js` implement the same `generate({ messages, systemInstruction })` interface. Add another provider by implementing this interface and selecting it in `server/app.js`.
- `server/retriever.js` is the RAG extension point. Replace its empty `retrieveContext({ query, messages })` implementation with your vector/database search and return documents shaped like `{ title, content, url? }`. The shared chat service adds those documents to the model context and returns their source titles/URLs as citations.

The retriever is intentionally not a fake knowledge base: until it is connected, the tutor is instructed not to claim that its answer is grounded in textbooks or other sources. Keep provider and vector-store credentials server-side. Chat content is sent to the selected model provider; use only data you are authorized to send.

The interface uses a generic retro puzzle-console style. The retriever is intentionally not a fake knowledge base: until it is connected, the tutor is instructed not to claim that its answer is grounded in textbooks or other sources.
