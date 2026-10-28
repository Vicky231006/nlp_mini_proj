function publicError(message) {
  const error = new Error(message);
  error.publicMessage = message;
  return error;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createOpenAICompatibleProvider({
  baseUrl,
  model,
  apiKey = '',
  timeoutMs = 120_000,
  fetchImpl = fetch
}) {
  return {
    async generate({ messages, systemInstruction }) {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
      }

      const maxAttempts = 8;
      let response;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          response = await fetchImpl(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers,
            signal: AbortSignal.timeout(timeoutMs),
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemInstruction },
                ...messages.map(({ role, content }) => ({ role, content }))
              ],
              temperature: 0.4
            })
          });
        } catch (err) {
          if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
            console.error(`[openAICompatible] Request to ${baseUrl} timed out after ${timeoutMs}ms.`);
            throw publicError(`The local model timed out after ${Math.round(timeoutMs / 1000)}s. It may still be loading into GPU/RAM.`);
          }
          console.error(`[openAICompatible] Connection to ${baseUrl} failed:`, err?.message || err);
          throw publicError('Could not connect to the configured OpenAI-compatible model. Check that it is running and reachable.');
        }

        if (response.status === 429 && attempt < maxAttempts) {
          const retryHeader = response.headers?.get ? response.headers.get('retry-after') : null;
          const retryAfterSec = Number.parseFloat(retryHeader || '0');
          const waitMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
            ? Math.ceil(retryAfterSec * 1000)
            : Math.min(15_000, 2000 * Math.pow(1.5, attempt - 1));
          console.warn(`[openAICompatible] Rate limited (HTTP 429). Waiting ${waitMs}ms before retry (attempt ${attempt}/${maxAttempts})...`);
          await delay(waitMs);
          continue;
        }

        break;
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
