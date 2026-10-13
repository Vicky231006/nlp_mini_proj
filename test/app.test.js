import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { createApp } from '../server/app.js';

test('chat API validates requests, reports provider status, and returns retrieved sources', async (context) => {
  const app = createApp({
    config: { provider: 'gemini', gemini: { apiKeys: ['test-key'] }, production: false },
    provider: {
      async generate({ messages }) {
        assert.equal(messages.at(-1).content, 'Follow-up');
        return 'A grounded response.';
      }
    },
    async retrieve({ query }) {
      assert.equal(query, 'Follow-up');
      return [{ title: 'Reference', content: 'Supporting material' }];
    }
  });
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => new Promise((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve())));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const health = await fetch(`${baseUrl}/api/health`);
  assert.deepEqual(await health.json(), { status: 'ok', provider: 'gemini', configured: true });

  const invalid = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [] })
  });
  assert.equal(invalid.status, 400);

  const valid = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Follow-up' }] })
  });
  assert.equal(valid.status, 200);
  assert.deepEqual(await valid.json(), {
    text: 'A grounded response.',
    citations: [{ title: 'Reference' }]
  });
});

test('chat API refuses to pretend Gemini is configured when no key is present', async (context) => {
  let modelWasCalled = false;
  const app = createApp({
    config: { provider: 'gemini', gemini: { apiKeys: [] }, production: false },
    provider: {
      async generate() {
        modelWasCalled = true;
        return 'This should not be returned.';
      }
    }
  });

  test('chat API rejects malformed learner practice profiles', async (context) => {
    const app = createApp({
      config: {
        provider: 'openai-compatible',
        openAICompatible: {},
        production: false
      },
      provider: {
        async generate() {
          throw new Error('Model should not run for an invalid profile.');
        }
      }
    });
    const server = createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    context.after(() => new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve())));

    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        assessmentProfile: { overall: {}, dimensions: {} }
      })
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /assessment profile/);
  });
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => new Promise((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve())));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] })
  });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /Gemini is not configured/);
  assert.equal(modelWasCalled, false);
});
