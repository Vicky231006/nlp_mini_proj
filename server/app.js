import express from 'express';
import { createChatService } from './chatService.js';
import { validateConversation } from './conversation.js';
import { retrieveContext } from './retriever.js';
import { createGeminiProvider } from './providers/gemini.js';
import { createOpenAICompatibleProvider } from './providers/openAICompatible.js';
import { projectRoot } from './config.js';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function createProvider(config) {
  if (config.provider === 'gemini') {
    return createGeminiProvider(config.gemini);
  }

  return createOpenAICompatibleProvider(config.openAICompatible);
}

export function createApp({ config, provider = createProvider(config), retrieve = retrieveContext } = {}) {
  const app = express();
  const chatService = createChatService({ provider, retrieve });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      provider: config.provider,
      configured: config.provider === 'gemini' ? config.gemini.apiKeys.length > 0 : true
    });
  });

  app.post('/api/chat', async (request, response) => {
    try {
      const messages = validateConversation(request.body?.messages);
      if (config.provider === 'gemini' && config.gemini.apiKeys.length === 0) {
        response.status(503).json({ error: 'Gemini is not configured. Add a Gemini API key to your local .env file.' });
        return;
      }
      const result = await chatService.reply(messages);
      response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const publicMessage = error && typeof error === 'object' && 'publicMessage' in error
        ? error.publicMessage
        : undefined;
      const isInputError = message.startsWith('Send between ')
        || message.startsWith('Each message ')
        || message.startsWith('The latest conversation ');
      const status = isInputError ? 400 : 502;
      response.status(status).json({
        error: status === 400
          ? message
          : typeof publicMessage === 'string'
            ? publicMessage
            : 'The tutor could not complete this request. Check server configuration and try again.'
      });
    }
  });

  if (config.production) {
    const distDirectory = resolve(projectRoot, 'dist');
    const indexFile = resolve(distDirectory, 'index.html');
    if (!existsSync(indexFile)) {
      throw new Error('Production build is missing. Run "npm run build" before starting the production server.');
    }

    app.use(express.static(distDirectory));
    app.get('*path', (request, response, next) => {
      if (request.path.startsWith('/api/')) {
        next();
        return;
      }
      response.sendFile(indexFile);
    });
  }

  app.use((error, _request, response, _next) => {
    if (error.type === 'entity.too.large') {
      response.status(413).json({ error: 'Request body is too large.' });
      return;
    }
    if (error instanceof SyntaxError && 'body' in error) {
      response.status(400).json({ error: 'Request body must be valid JSON.' });
      return;
    }
    response.status(500).json({ error: 'The server could not process this request.' });
  });

  return app;
}
