let csrfToken = null;

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;

  const response = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const payload = response.status === 204
    ? null
    : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `The server returned HTTP ${response.status}.`);
  }
  return payload;
}

function rememberSession(payload) {
  csrfToken = payload?.csrfToken || null;
  return payload;
}

export async function loadAccountSession() {
  return rememberSession(await request('/api/auth/session'));
}

export async function signUp({ displayName, email, password, classStandard }) {
  return rememberSession(await request('/api/auth/signup', {
    method: 'POST',
    body: { displayName, email, password, classStandard }
  }));
}

export function updateClassStandard(classStandard) {
  return request('/api/account/class', {
    method: 'PATCH',
    body: { classStandard }
  });
}

export async function signIn({ email, password }) {
  return rememberSession(await request('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  }));
}

export async function signOut() {
  await request('/api/auth/logout', { method: 'POST', body: {} });
  csrfToken = null;
}

export function loadSavedAssessment() {
  return request('/api/account/assessment');
}

export function createAssessmentAttempt() {
  return request('/api/assessment/attempts', { method: 'POST', body: {} });
}

export function submitAssessment(attemptId, questions, answers) {
  return request('/api/assessment/submit', {
    method: 'POST',
    body: {
      attemptId,
      answers: questions.map((question, index) => ({
        questionId: question.id,
        optionId: answers[index]
      }))
    }
  });
}

export function loadConversations() {
  return request('/api/chats');
}

export function deleteConversation(conversationId) {
  return request(`/api/chats/${encodeURIComponent(conversationId)}`, {
    method: 'DELETE'
  });
}

export function renameConversation(conversationId, title) {
  return request(`/api/chats/${encodeURIComponent(conversationId)}`, {
    method: 'PATCH',
    body: { title }
  });
}

export function sendStudentQuery(conversationId, messages) {
  return request('/api/chat', {
    method: 'POST',
    body: { conversationId, messages }
  });
}

export async function getChatHealth() {
  const response = await fetch('/api/health');
  if (!response.ok) throw new Error(`Chat service returned HTTP ${response.status}.`);
  return response.json();
}
