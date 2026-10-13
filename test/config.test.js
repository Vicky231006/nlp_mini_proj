import assert from 'node:assert/strict';
import test from 'node:test';
import { getServerConfig } from '../server/config.js';

test('selects an OpenAI-compatible local model from environment settings', (context) => {
  const previous = {
    CHAT_PROVIDER: process.env.CHAT_PROVIDER,
    LOCAL_MODEL_BASE_URL: process.env.LOCAL_MODEL_BASE_URL,
    LOCAL_MODEL_NAME: process.env.LOCAL_MODEL_NAME,
    LOCAL_MODEL_API_KEY: process.env.LOCAL_MODEL_API_KEY
  };
  context.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  process.env.CHAT_PROVIDER = 'openai-compatible';
  process.env.LOCAL_MODEL_BASE_URL = 'http://127.0.0.1:11434/v1';
  process.env.LOCAL_MODEL_NAME = 'test-local-model';
  process.env.LOCAL_MODEL_API_KEY = '';

  const config = getServerConfig();
  assert.equal(config.provider, 'openai-compatible');
  assert.equal(config.openAICompatible.baseUrl, 'http://127.0.0.1:11434/v1');
  assert.equal(config.openAICompatible.model, 'test-local-model');
});

test('does not treat the example API key value as a configured Gemini credential', (context) => {
  const previous = {
    CHAT_PROVIDER: process.env.CHAT_PROVIDER,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_API_KEYS: process.env.GEMINI_API_KEYS,
    api_key1: process.env.api_key1,
    api_key2: process.env.api_key2,
    api_key3: process.env.api_key3
  };
  context.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  process.env.CHAT_PROVIDER = 'gemini';
  process.env.GEMINI_API_KEY = 'replace-with-your-gemini-api-key';
  process.env.GEMINI_API_KEYS = '';
  delete process.env.api_key1;
  delete process.env.api_key2;
  delete process.env.api_key3;

  assert.equal(getServerConfig().gemini.apiKeys.length, 0);
});
