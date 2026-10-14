import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { createApp } from '../server/app.js';
import { createAccountDatabase } from '../server/accountStore.js';

function sessionCookie(response) {
  return response.headers.get('set-cookie')?.split(';', 1)[0];
}

async function jsonRequest(baseUrl, path, { method = 'GET', body, cookie, csrfToken } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (cookie) headers.Cookie = cookie;
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const payload = response.status === 204 ? null : await response.json();
  return { response, payload };
}

async function createUser(baseUrl, email) {
  const { response, payload } = await jsonRequest(baseUrl, '/api/auth/signup', {
    method: 'POST',
    body: { displayName: email.split('@')[0], email, password: 'test-password-123' }
  });
  assert.equal(response.status, 201);
  return { cookie: sessionCookie(response), csrfToken: payload.csrfToken, user: payload.user };
}

async function finishAssessment(baseUrl, session) {
  const attempt = await jsonRequest(baseUrl, '/api/assessment/attempts', {
    method: 'POST',
    body: {},
    ...session
  });
  assert.equal(attempt.response.status, 201);
  const { attemptId, questions } = attempt.payload;
  const submitted = await jsonRequest(baseUrl, '/api/assessment/submit', {
    method: 'POST',
    body: {
      attemptId,
      answers: questions.map((question) => ({
        questionId: question.id,
        optionId: null
      }))
    },
    ...session
  });
  assert.equal(submitted.response.status, 200);
  return { attempt: attempt.payload, saved: submitted.payload };
}

test('accounts require assessment, save server-scored results, and keep chats private and persistent', async (context) => {
  const database = createAccountDatabase(':memory:');
  const generatedPrompts = [];
  const app = createApp({
    database,
    config: {
      provider: 'openai-compatible',
      openAICompatible: {},
      production: false
    },
    provider: {
      async generate({ systemInstruction }) {
        generatedPrompts.push(systemInstruction);
        return 'Let us solve that together.';
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
  const unauthenticated = await jsonRequest(baseUrl, '/api/chats');
  assert.equal(unauthenticated.response.status, 401);

  const first = await createUser(baseUrl, 'learner@example.test');
  const duplicate = await jsonRequest(baseUrl, '/api/auth/signup', {
    method: 'POST',
    body: { displayName: 'Another name', email: 'LEARNER@example.test', password: 'test-password-123' }
  });
  assert.equal(duplicate.response.status, 409);
  const wrongPassword = await jsonRequest(baseUrl, '/api/auth/login', {
    method: 'POST',
    body: { email: 'learner@example.test', password: 'incorrect-password' }
  });
  assert.equal(wrongPassword.response.status, 401);

  const gatedChat = await jsonRequest(baseUrl, '/api/chat', {
    method: 'POST',
    body: { messages: [{ role: 'user', content: 'Help me' }] },
    ...first
  });
  assert.equal(gatedChat.response.status, 403);
  assert.match(gatedChat.payload.error, /Complete the puzzle practice/);

  const noCsrf = await jsonRequest(baseUrl, '/api/assessment/attempts', {
    method: 'POST',
    body: {},
    cookie: first.cookie
  });
  assert.equal(noCsrf.response.status, 403);

  const attemptResponse = await jsonRequest(baseUrl, '/api/assessment/attempts', {
    method: 'POST',
    body: {},
    ...first
  });
  assert.equal(attemptResponse.response.status, 201);
  assert.equal(attemptResponse.payload.questions.length, 25);
  assert.ok(attemptResponse.payload.questions.every((question) =>
    question.options.every((option) => !('correct' in option) && !('rationale' in option))));

  const { attemptId, questions } = attemptResponse.payload;
  const firstSubmission = await jsonRequest(baseUrl, '/api/assessment/submit', {
    method: 'POST',
    body: {
      attemptId,
      answers: questions.map((question) => ({
        questionId: question.id,
        optionId: question.options[0].id
      }))
    },
    ...first
  });
  assert.equal(firstSubmission.response.status, 200);
  assert.equal(firstSubmission.payload.results.total, 25);
  assert.equal(
    Object.values(firstSubmission.payload.results.dimensions).reduce((sum, score) => sum + score.total, 0),
    25
  );
  assert.equal(firstSubmission.payload.review.length, 25);

  const savedProfile = await jsonRequest(baseUrl, '/api/account/assessment', first);
  assert.deepEqual(savedProfile.payload.profile, firstSubmission.payload.profile);

  const forgedProfile = {
    overall: { correct: 25, total: 25, answered: 25 },
    dimensions: {}
  };
  const chat = await jsonRequest(baseUrl, '/api/chat', {
    method: 'POST',
    body: {
      conversationId: null,
      messages: [{ role: 'user', content: 'Can you give me an example?' }],
      assessmentProfile: forgedProfile
    },
    ...first
  });
  assert.equal(chat.response.status, 200);
  assert.equal(chat.payload.text, 'Let us solve that together.');
  assert.match(
    generatedPrompts[0],
    new RegExp(`Overall: ${firstSubmission.payload.profile.overall.correct}/25 correct`)
  );

  const savedChats = await jsonRequest(baseUrl, '/api/chats', first);
  assert.equal(savedChats.payload.chats.length, 1);
  assert.equal(savedChats.payload.chats[0].messages.length, 2);
  assert.equal(savedChats.payload.chats[0].messages[0].content, 'Can you give me an example?');

  let chainedMessages = savedChats.payload.chats[0].messages.map(({ role, content }) => ({ role, content }));
  for (let index = 0; index < 21; index += 1) {
    chainedMessages.push({ role: 'user', content: `Follow-up ${index}` });
    const chainedReply = await jsonRequest(baseUrl, '/api/chat', {
      method: 'POST',
      body: {
        conversationId: chat.payload.conversationId,
        messages: chainedMessages.slice(-40)
      },
      ...first
    });
    assert.equal(chainedReply.response.status, 200);
    chainedMessages.push({ role: 'assistant', content: chainedReply.payload.text });
  }
  const extendedHistory = await jsonRequest(baseUrl, '/api/chats', first);
  assert.equal(extendedHistory.payload.chats[0].messages.length, 44);

  const second = await createUser(baseUrl, 'another@example.test');
  const otherAssessment = await finishAssessment(baseUrl, second);
  assert.equal(otherAssessment.saved.profile.overall.correct, 0);
  const cannotDeleteAnotherUsersChat = await jsonRequest(
    baseUrl,
    `/api/chats/${chat.payload.conversationId}`,
    { method: 'DELETE', ...second }
  );
  assert.equal(cannotDeleteAnotherUsersChat.response.status, 404);
  const isolatedChats = await jsonRequest(baseUrl, '/api/chats', second);
  assert.deepEqual(isolatedChats.payload.chats, []);

  await jsonRequest(baseUrl, '/api/auth/logout', {
    method: 'POST',
    body: {},
    ...first
  }).then(({ response }) => assert.equal(response.status, 204));
  const signedInAgain = await jsonRequest(baseUrl, '/api/auth/login', {
    method: 'POST',
    body: { email: 'learner@example.test', password: 'test-password-123' }
  });
  assert.equal(signedInAgain.response.status, 200);
  const restoredChats = await jsonRequest(baseUrl, '/api/chats', {
    cookie: sessionCookie(signedInAgain.response),
    csrfToken: signedInAgain.payload.csrfToken
  });
  assert.equal(restoredChats.payload.chats.length, 1);
  assert.equal(restoredChats.payload.chats[0].messages[1].content, 'Let us solve that together.');
});

test('follow-ups reuse the listed conversation id and titles can be renamed by their owner', async (context) => {
  const database = createAccountDatabase(':memory:');
  const app = createApp({
    database,
    config: {
      provider: 'openai-compatible',
      openAICompatible: {},
      production: false
    },
    provider: {
      async generate() {
        return 'Hi there.';
      }
    },
    retrieve: async () => []
  });
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => {
    database.close();
    return new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve()));
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const user = await createUser(baseUrl, 'renamer@example.test');
  await finishAssessment(baseUrl, user);

  const first = await jsonRequest(baseUrl, '/api/chat', {
    method: 'POST',
    body: { conversationId: null, messages: [{ role: 'user', content: 'First question' }] },
    ...user
  });
  assert.equal(first.response.status, 200);
  const conversationId = first.payload.conversationId;

  // Simulate a refreshed client: it only knows the server-provided id from
  // GET /api/chats, and the follow-up must append instead of forking.
  const listed = await jsonRequest(baseUrl, '/api/chats', user);
  assert.equal(listed.payload.chats.length, 1);
  const history = listed.payload.chats[0].messages.map(({ role, content }) => ({ role, content }));
  const followUp = await jsonRequest(baseUrl, '/api/chat', {
    method: 'POST',
    body: {
      conversationId: listed.payload.chats[0].id,
      messages: [...history, { role: 'user', content: 'Second question' }]
    },
    ...user
  });
  assert.equal(followUp.response.status, 200);
  assert.equal(followUp.payload.conversationId, conversationId);
  const relisted = await jsonRequest(baseUrl, '/api/chats', user);
  assert.equal(relisted.payload.chats.length, 1);
  assert.equal(relisted.payload.chats[0].messages.length, 4);

  const blankTitle = await jsonRequest(baseUrl, `/api/chats/${conversationId}`, {
    method: 'PATCH',
    body: { title: '   ' },
    ...user
  });
  assert.equal(blankTitle.response.status, 400);

  const renamed = await jsonRequest(baseUrl, `/api/chats/${conversationId}`, {
    method: 'PATCH',
    body: { title: 'My biology questions' },
    ...user
  });
  assert.equal(renamed.response.status, 200);
  assert.deepEqual(renamed.payload, { id: conversationId, title: 'My biology questions' });
  const afterRename = await jsonRequest(baseUrl, '/api/chats', user);
  assert.equal(afterRename.payload.chats[0].title, 'My biology questions');
  assert.equal(afterRename.payload.chats[0].messages.length, 4);

  const missing = await jsonRequest(baseUrl, '/api/chats/does-not-exist', {
    method: 'PATCH',
    body: { title: 'Nothing' },
    ...user
  });
  assert.equal(missing.response.status, 404);

  const other = await createUser(baseUrl, 'intruder@example.test');
  await finishAssessment(baseUrl, other);
  const foreign = await jsonRequest(baseUrl, `/api/chats/${conversationId}`, {
    method: 'PATCH',
    body: { title: 'Hijacked' },
    ...other
  });
  assert.equal(foreign.response.status, 404);

  const unauthenticated = await jsonRequest(baseUrl, `/api/chats/${conversationId}`, {
    method: 'PATCH',
    body: { title: 'Nobody' }
  });
  assert.equal(unauthenticated.response.status, 401);
});

test('class standard is captured at signup and can be updated later', async (context) => {
  const database = createAccountDatabase(':memory:');
  const app = createApp({
    database,
    config: {
      provider: 'openai-compatible',
      openAICompatible: {},
      production: false
    },
    provider: {
      async generate() {
        return 'Hi there.';
      }
    },
    retrieve: async () => []
  });
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => {
    database.close();
    return new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve()));
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const signup = await jsonRequest(baseUrl, '/api/auth/signup', {
    method: 'POST',
    body: {
      displayName: 'Std Four',
      email: 'std4@example.test',
      password: 'test-password-123',
      classStandard: 4
    }
  });
  assert.equal(signup.response.status, 201);
  assert.equal(signup.payload.user.classStandard, 4);
  const session = { cookie: sessionCookie(signup.response), csrfToken: signup.payload.csrfToken };

  const restored = await jsonRequest(baseUrl, '/api/auth/session', session);
  assert.equal(restored.payload.user.classStandard, 4);

  const updated = await jsonRequest(baseUrl, '/api/account/class', {
    method: 'PATCH',
    body: { classStandard: 2 },
    ...session
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.payload.user.classStandard, 2);

  const invalid = await jsonRequest(baseUrl, '/api/account/class', {
    method: 'PATCH',
    body: { classStandard: 99 },
    ...session
  });
  assert.equal(invalid.response.status, 400);

  const missing = await jsonRequest(baseUrl, '/api/account/class', {
    method: 'PATCH',
    body: { classStandard: 3 }
  });
  assert.equal(missing.response.status, 401);

  const withoutClass = await jsonRequest(baseUrl, '/api/auth/signup', {
    method: 'POST',
    body: { displayName: 'No Class', email: 'noclass@example.test', password: 'test-password-123' }
  });
  assert.equal(withoutClass.response.status, 201);
  assert.equal(withoutClass.payload.user.classStandard, null);

  const badSignup = await jsonRequest(baseUrl, '/api/auth/signup', {
    method: 'POST',
    body: {
      displayName: 'Bad Class',
      email: 'badclass@example.test',
      password: 'test-password-123',
      classStandard: 0
    }
  });
  assert.equal(badSignup.response.status, 400);
});
