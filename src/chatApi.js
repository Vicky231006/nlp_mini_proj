export async function getChatHealth() {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error(`Chat service returned HTTP ${response.status}.`);
  }
  return response.json();
}

export async function sendStudentQuery(messages, assessmentProfile = null) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, assessmentProfile })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `Chat service returned HTTP ${response.status}.`);
  }

  if (
    typeof payload !== 'object'
    || payload === null
    || typeof payload.text !== 'string'
    || !payload.text.trim()
    || !Array.isArray(payload.citations)
    || payload.citations.some((citation) =>
      typeof citation !== 'object'
      || citation === null
      || typeof citation.title !== 'string'
      || (citation.url !== undefined && typeof citation.url !== 'string'))
  ) {
    throw new Error('Chat service returned an invalid response.');
  }

  return payload;
}
