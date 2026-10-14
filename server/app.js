import express from 'express';
import { createChatService } from './chatService.js';
import { validateConversation } from './conversation.js';
import {
  calculateAssessmentResults,
  createAssessmentProfile,
  createAssessmentSession
} from '../shared/assessment.js';
import { ITEM_BANK } from '../src/assessment/questionBank.js';
import { retrieveContext } from './retriever.js';
import { createGeminiProvider } from './providers/gemini.js';
import { createOpenAICompatibleProvider } from './providers/openAICompatible.js';
import { projectRoot } from './config.js';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createAccountDatabase, createAccountStore } from './accountStore.js';

const AUTH_COOKIE = 'puzzle_session';
const AUTH_RATE_WINDOW_MS = 15 * 60 * 1000;
const AUTH_RATE_LIMIT = 8;

function getCookie(request, name) {
  const cookieHeader = request.headers.cookie || '';
  const match = cookieHeader.split(';').map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

function setSessionCookie(response, token, production) {
  response.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: production,
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

function clearSessionCookie(response, production) {
  response.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: production,
    sameSite: 'strict',
    path: '/'
  });
}

function publicQuestion(item) {
  return {
    id: item.id,
    construct: item.construct,
    format: item.format,
    stimulus: item.stimulus,
    options: item.options.map(({ id, shapes }) => ({ id, shapes }))
  };
}

function mergeConversationHistory(savedMessages, recentMessages) {
  let overlap = Math.min(savedMessages.length, recentMessages.length);
  while (overlap > 0) {
    const savedSuffix = savedMessages.slice(-overlap);
    const recentPrefix = recentMessages.slice(0, overlap);
    if (savedSuffix.every((message, index) =>
      message.role === recentPrefix[index].role
      && message.content === recentPrefix[index].content
    )) {
      break;
    }
    overlap -= 1;
  }
  return [...savedMessages, ...recentMessages.slice(overlap)];
}

export function createProvider(config) {
  if (config.provider === 'gemini') {
    return createGeminiProvider(config.gemini);
  }

  return createOpenAICompatibleProvider(config.openAICompatible);
}

export function createApp({
  config,
  provider = createProvider(config),
  retrieve = retrieveContext,
  database = createAccountDatabase()
} = {}) {
  const app = express();
  const chatService = createChatService({ provider, retrieve });
  const accounts = createAccountStore(database);
  const authAttempts = new Map();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '512kb' }));

  const authenticate = (request, response, next) => {
    const session = accounts.authenticate(getCookie(request, AUTH_COOKIE));
    if (!session) {
      response.status(401).json({ error: 'Please sign in to continue.' });
      return;
    }
    request.account = session;
    next();
  };

  const requireCsrf = (request, response, next) => {
    if (!accounts.validateCsrf(request.account.csrfToken, request.get('x-csrf-token'))) {
      response.status(403).json({ error: 'Your session security token is missing or expired. Refresh and try again.' });
      return;
    }
    next();
  };

  const rateLimitAuth = (request, response, next) => {
    const address = request.ip || request.socket.remoteAddress || 'unknown';
    const timestamp = Date.now();
    const recentAttempts = (authAttempts.get(address) || []).filter((attempt) =>
      timestamp - attempt < AUTH_RATE_WINDOW_MS
    );
    if (recentAttempts.length >= AUTH_RATE_LIMIT) {
      response.status(429).json({ error: 'Too many sign-in attempts. Please wait a little and try again.' });
      return;
    }
    recentAttempts.push(timestamp);
    authAttempts.set(address, recentAttempts);
    next();
  };

  const requireAssessment = (request, response, next) => {
    if (!accounts.getAssessment(request.account.user.id)) {
      response.status(403).json({ error: 'Complete the puzzle practice before chatting with the tutor.' });
      return;
    }
    next();
  };

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      provider: config.provider,
      configured: config.provider === 'gemini' ? config.gemini.apiKeys.length > 0 : true,
      retrieval: config.retrieval
        ? {
          enabled: config.retrieval.enabled,
          baseUrl: config.retrieval.baseUrl,
          topK: config.retrieval.topK,
          minScore: config.retrieval.minScore
        }
        : { enabled: false }
    });
  });

  app.post('/api/auth/signup', rateLimitAuth, async (request, response) => {
    try {
      const result = await accounts.register({
        email: request.body?.email,
        displayName: request.body?.displayName,
        password: request.body?.password
      });
      setSessionCookie(response, result.session.token, config.production);
      response.status(201).json({ user: result.user, csrfToken: result.session.csrfToken });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = message.startsWith('Enter a valid')
        || message.startsWith('Choose a name')
        || message.startsWith('Your password')
        ? 400
        : message.startsWith('An account with')
          ? 409
          : 500;
      response.status(status).json({
        error: status === 500 ? 'The account could not be created. Please try again.' : message
      });
    }
  });

  app.post('/api/auth/login', rateLimitAuth, async (request, response) => {
    try {
      const result = await accounts.login({
        email: request.body?.email,
        password: request.body?.password
      });
      setSessionCookie(response, result.session.token, config.production);
      response.json({ user: result.user, csrfToken: result.session.csrfToken });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = message.startsWith('Email or password') ? 401 : 500;
      response.status(status).json({
        error: status === 500 ? 'Sign-in could not be completed. Please try again.' : message
      });
    }
  });

  app.get('/api/auth/session', (request, response) => {
    const session = accounts.authenticate(getCookie(request, AUTH_COOKIE));
    if (!session) {
      response.json({ user: null, csrfToken: null });
      return;
    }
    response.json({ user: session.user, csrfToken: session.csrfToken });
  });

  app.post('/api/auth/logout', authenticate, requireCsrf, (request, response) => {
    accounts.logout(getCookie(request, AUTH_COOKIE));
    clearSessionCookie(response, config.production);
    response.status(204).end();
  });

  app.get('/api/account/assessment', authenticate, (request, response) => {
    response.json(accounts.getAssessment(request.account.user.id));
  });

  app.post('/api/assessment/attempts', authenticate, requireCsrf, (request, response) => {
    const questions = createAssessmentSession(ITEM_BANK);
    const attemptId = randomUUID();
    const questionIds = questions.map(({ id }) => id);
    accounts.createAttempt(request.account.user.id, attemptId, questionIds);
    response.status(201).json({
      attemptId,
      questions: questions.map(publicQuestion)
    });
  });

  app.post('/api/assessment/submit', authenticate, requireCsrf, (request, response) => {
    const { attemptId, answers } = request.body || {};
    const attempt = typeof attemptId === 'string'
      ? accounts.getAttempt(request.account.user.id, attemptId)
      : null;
    if (!attempt) {
      response.status(400).json({ error: 'This puzzle set has expired. Start a fresh set and try again.' });
      return;
    }
    if (!Array.isArray(answers) || answers.length !== attempt.questionIds.length) {
      response.status(400).json({ error: 'Answers must include one selection for each puzzle.' });
      return;
    }

    const items = attempt.questionIds.map((questionId) => ITEM_BANK.find((item) => item.id === questionId));
    const answerMap = new Map();
    for (const answer of answers) {
      if (
        typeof answer?.questionId !== 'string'
        || answerMap.has(answer.questionId)
        || !attempt.questionIds.includes(answer.questionId)
        || !(answer.optionId === null
          || (typeof answer.optionId === 'string'
            && items.find((item) => item.id === answer.questionId)
              ?.options.some((option) => option.id === answer.optionId)))
      ) {
        response.status(400).json({ error: 'One or more puzzle answers are invalid.' });
        return;
      }
      answerMap.set(answer.questionId, answer.optionId);
    }
    if (answerMap.size !== attempt.questionIds.length) {
      response.status(400).json({ error: 'Answers must include one selection for each puzzle.' });
      return;
    }

    const selectedAnswers = attempt.questionIds.map((questionId) => answerMap.get(questionId));
    const results = calculateAssessmentResults(items, selectedAnswers);
    const profile = createAssessmentProfile(results);
    accounts.saveAssessment(request.account.user.id, profile, results);
    accounts.deleteAttempt(request.account.user.id, attemptId);
    response.json({
      profile,
      results,
      review: items.map((item) => ({
        questionId: item.id,
        correctOptionId: item.options.find((option) => option.correct).id,
        rationale: item.options.find((option) => option.correct).rationale
      }))
    });
  });

  app.get('/api/chats', authenticate, requireAssessment, (request, response) => {
    response.json({ chats: accounts.listConversations(request.account.user.id) });
  });

  app.delete('/api/chats/:id', authenticate, requireCsrf, requireAssessment, (request, response) => {
    if (!accounts.deleteConversation(request.account.user.id, request.params.id)) {
      response.status(404).json({ error: 'That conversation was not found.' });
      return;
    }
    response.status(204).end();
  });

  app.patch('/api/chats/:id', authenticate, requireCsrf, requireAssessment, (request, response) => {
    const title = typeof request.body?.title === 'string' ? request.body.title.trim() : '';
    if (!title || title.length > 100) {
      response.status(400).json({ error: 'Give the chat a title between 1 and 100 characters.' });
      return;
    }
    const renamed = accounts.renameConversation(request.account.user.id, request.params.id, title);
    if (!renamed) {
      response.status(404).json({ error: 'That conversation was not found.' });
      return;
    }
    response.json(renamed);
  });

  app.post('/api/chat', authenticate, requireCsrf, requireAssessment, async (request, response) => {
    try {
      const messages = validateConversation(request.body?.messages);
      const profile = accounts.getAssessment(request.account.user.id)?.profile;
      const requestedConversationId = request.body?.conversationId;
      let conversationId;
      let existingConversation = null;
      if (requestedConversationId === null || requestedConversationId === undefined) {
        conversationId = randomUUID();
      } else if (typeof requestedConversationId === 'string') {
        existingConversation = accounts.getConversation(request.account.user.id, requestedConversationId);
        if (!existingConversation) {
          response.status(404).json({ error: 'That conversation was not found. Start a new chat.' });
          return;
        }
        conversationId = existingConversation.id;
      } else {
        response.status(400).json({ error: 'The conversation ID is invalid.' });
        return;
      }
      if (config.provider === 'gemini' && config.gemini.apiKeys.length === 0) {
        response.status(503).json({ error: 'Gemini is not configured. Add a Gemini API key to your local .env file.' });
        return;
      }
      const result = await chatService.reply(messages, profile);
      const fullMessages = mergeConversationHistory(existingConversation?.messages || [], messages);
      fullMessages.push({ role: 'assistant', content: result.text, citations: result.citations });
      const title = existingConversation?.title || messages.find((message) => message.role === 'user').content.slice(0, 48);
      accounts.saveConversation(request.account.user.id, conversationId, title, fullMessages);
      response.json({ ...result, conversationId });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isInputError = message.startsWith('Send between ')
        || message.startsWith('Each message ')
        || message.startsWith('The latest conversation ');
      const publicMessage = error && typeof error === 'object' && 'publicMessage' in error
        ? error.publicMessage
        : undefined;
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
