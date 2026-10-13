import assert from 'node:assert/strict';
import test from 'node:test';
import { createGeminiProvider } from '../server/providers/gemini.js';
import { createOpenAICompatibleProvider } from '../server/providers/openAICompatible.js';

test('Gemini provider maps conversation history and extracts the generated text', async () => {
  let requestBody;
  const provider = createGeminiProvider({
    apiKeys: ['test-key'],
    model: 'gemini-test',
    async fetchImpl(url, options) {
      assert.match(url, /models\/gemini-test:generateContent\?key=test-key$/);
      requestBody = JSON.parse(options.body);
      return Response.json({
        candidates: [{ content: { parts: [{ text: 'Hello ' }, { text: 'again.' }] } }]
      });
    }
  });

  const result = await provider.generate({
    systemInstruction: 'Be helpful.',
    messages: [
      { role: 'user', content: 'Hi.' },
      { role: 'assistant', content: 'Hello.' },
      { role: 'user', content: 'Continue.' }
    ]
  });

  assert.equal(result, 'Hello again.');
  assert.deepEqual(requestBody.contents.map((item) => item.role), ['user', 'model', 'user']);
});

test('Gemini provider retries the next configured key after a failed key', async () => {
  const attempted = [];
  const provider = createGeminiProvider({
    apiKeys: ['first', 'second'],
    model: 'gemini-test',
    async fetchImpl(url) {
      attempted.push(new URL(url).searchParams.get('key'));
      if (attempted.length === 1) return new Response(null, { status: 403 });
      return Response.json({ candidates: [{ content: { parts: [{ text: 'Ready.' }] } }] });
    }
  });

  assert.equal(await provider.generate({
    systemInstruction: 'Be helpful.',
    messages: [{ role: 'user', content: 'Hi.' }]
  }), 'Ready.');
  assert.deepEqual(attempted, ['first', 'second']);
});

test('Gemini provider retries a transient service error before failing over', async () => {
  let attempts = 0;
  const provider = createGeminiProvider({
    apiKeys: ['first-key'],
    model: 'gemini-test',
    async fetchImpl() {
      attempts += 1;
      if (attempts === 1) return new Response(null, { status: 503, headers: { 'Retry-After': '0' } });
      return Response.json({ candidates: [{ content: { parts: [{ text: 'Recovered.' }] } }] });
    }
  });

  assert.equal(await provider.generate({
    systemInstruction: 'Be helpful.',
    messages: [{ role: 'user', content: 'Hi.' }]
  }), 'Recovered.');
  assert.equal(attempts, 2);
});

test('OpenAI-compatible provider sends history and optional authentication', async () => {
  let request;
  const provider = createOpenAICompatibleProvider({
    baseUrl: 'http://127.0.0.1:11434/v1',
    model: 'local-model',
    apiKey: 'local-secret',
    async fetchImpl(url, options) {
      request = { url, options };
      return Response.json({ choices: [{ message: { content: 'Local answer.' } }] });
    }
  });

  const result = await provider.generate({
    systemInstruction: 'Be helpful.',
    messages: [
      { role: 'user', content: 'First.' },
      { role: 'assistant', content: 'Second.' },
      { role: 'user', content: 'Follow-up.' }
    ]
  });

  const body = JSON.parse(request.options.body);
  assert.equal(result, 'Local answer.');
  assert.equal(request.url, 'http://127.0.0.1:11434/v1/chat/completions');
  assert.equal(request.options.headers.Authorization, 'Bearer local-secret');
  assert.deepEqual(body.messages.map((message) => message.role), ['system', 'user', 'assistant', 'user']);
});
