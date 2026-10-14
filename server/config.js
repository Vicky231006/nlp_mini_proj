import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const envFile = resolve(projectRoot, '.env');

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

function geminiApiKeys() {
  const configured = [
    process.env.GEMINI_API_KEY,
    ...(process.env.GEMINI_API_KEYS || '').split(','),
    process.env.api_key1,
    process.env.api_key2,
    process.env.api_key3
  ];

  return [...new Set(configured
    .map((key) => key?.trim())
    .filter((key) => key && !/^(replace[-_ ]?with|your[-_ ]?)/i.test(key)))];
}

function getOpenAICompatibleBaseUrl() {
  const value = process.env.LOCAL_MODEL_BASE_URL || 'http://127.0.0.1:11434/v1';
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error('LOCAL_MODEL_BASE_URL must be a valid HTTP or HTTPS URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('LOCAL_MODEL_BASE_URL must be an HTTP or HTTPS URL without embedded credentials.');
  }

  return url.toString().replace(/\/$/, '');
}

export function getServerConfig() {
  const provider = (process.env.CHAT_PROVIDER || 'gemini').trim().toLowerCase();
  if (!['gemini', 'openai-compatible'].includes(provider)) {
    throw new Error('CHAT_PROVIDER must be "gemini" or "openai-compatible".');
  }

  const retrievalTopK = Math.min(5, Math.max(1,
    Number.parseInt(process.env.NCERT_RETRIEVAL_TOP_K || '5', 10) || 5));
  const retrievalTimeoutMs = Math.min(60_000, Math.max(1_000,
    Number.parseInt(process.env.NCERT_RETRIEVAL_TIMEOUT_MS || '15000', 10) || 15_000));
  const retrievalMinScore = Number.parseFloat(process.env.NCERT_RETRIEVAL_MIN_SCORE ?? '');
  const retrievalMinScoreClamped = Number.isFinite(retrievalMinScore)
    ? Math.min(10, Math.max(-10, retrievalMinScore))
    : 0;

  return {
    port: Number.parseInt(process.env.PORT || '3001', 10),
    production: process.env.NODE_ENV === 'production',
    provider,
    gemini: {
      apiKeys: geminiApiKeys(),
      model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
    },
    openAICompatible: {
      baseUrl: getOpenAICompatibleBaseUrl(),
      model: process.env.LOCAL_MODEL_NAME || 'qwen2.5:1.5b',
      apiKey: process.env.LOCAL_MODEL_API_KEY || ''
    },
    retrieval: {
      enabled: process.env.NCERT_RETRIEVAL_ENABLED !== 'false'
        && process.env.NCERT_RETRIEVAL_ENABLED !== '0',
      baseUrl: (process.env.NCERT_RETRIEVAL_URL || 'http://127.0.0.1:8000').replace(/\/+$/, ''),
      topK: retrievalTopK,
      timeoutMs: retrievalTimeoutMs,
      minScore: retrievalMinScoreClamped
    }
  };
}

export { projectRoot };
