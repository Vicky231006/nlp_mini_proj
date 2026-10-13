function publicError(message) {
  const error = new Error(message);
  error.publicMessage = message;
  return error;
}

export function createOpenAICompatibleProvider({
  baseUrl,
  model,
  apiKey = '',
  fetchImpl = fetch
}) {
  return {
    async generate({ messages, systemInstruction }) {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
      }

      let response;
      try {
        response = await fetchImpl(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          signal: AbortSignal.timeout(60_000),
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemInstruction },
              ...messages.map(({ role, content }) => ({ role, content }))
            ],
            temperature: 0.4
          })
        });
      } catch {
        throw publicError('Could not connect to the configured OpenAI-compatible model. Check that it is running and reachable.');
      }

      if (!response.ok) {
        throw publicError(`Local model request failed (HTTP ${response.status}). Check the configured endpoint and model name.`);
      }

      const payload = await response.json();
      const text = payload.choices?.[0]?.message?.content;
      if (typeof text !== 'string' || !text.trim()) {
        throw publicError('The configured model returned an empty response.');
      }

      return text.trim();
    }
  };
}
