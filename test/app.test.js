import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { createApp } from '../server/app.js';
import { createAccountDatabase } from '../server/accountStore.js';

test('health is public, but chat requires an authenticated, assessed learner', async (context) => {
  const database = createAccountDatabase(':memory:');
  let modelWasCalled = false;
  const app = createApp({
    database,
    config: {
      provider: 'gemini',
      gemini: { apiKeys: ['test-key'] },
      production: false
    },
    provider: {
      async generate() {
        modelWasCalled = true;
        return 'This should not be returned.';
      }
    }
  });
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => {
    database.close();
    return new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve()));
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const health = await fetch(`${baseUrl}/api/health`);
  assert.deepEqual(await health.json(), { status: 'ok', provider: 'gemini', configured: true });

  const unauthorized = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] })
  });
  assert.equal(unauthorized.status, 401);
  assert.equal(modelWasCalled, false);
});
