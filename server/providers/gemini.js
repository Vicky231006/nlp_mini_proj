function retryableStatus(status) {
  return status === 400 || status === 401 || status === 403 || status === 429 || status >= 500;
}

function publicError(message) {
  const error = new Error(message);
  error.publicMessage = message;
  return error;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function createGeminiProvider({ apiKeys, model, fetchImpl = fetch }) {
  return {
    async generate({ messages, systemInstruction }) {
      if (!apiKeys.length) {
        throw publicError('No Gemini API key is configured. Set GEMINI_API_KEY in .env.');
      }

      let lastStatus;

      for (const apiKey of apiKeys) {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          let response;
          try {
            response = await fetchImpl(
              `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(60_000),
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: systemInstruction }] },
                  contents: messages.map((message) => ({
                    role: message.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: message.content }]
                  })),
                  generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
                })
              }
            );
          } catch {
            throw publicError('Could not connect to the Gemini API. Check the server network and try again.');
          }

          if (response.ok) {
            const payload = await response.json();
            const text = payload.candidates?.[0]?.content?.parts
              ?.map((part) => part.text || '')
              .join('')
              .trim();

            if (!text) {
              throw publicError('Gemini did not return a text response. The request may have been blocked by a safety filter.');
            }

            return text;
          }

          lastStatus = response.status;
          await response.body?.cancel();
          if (!retryableStatus(response.status)) break;
          if (response.status === 400 || response.status === 401 || response.status === 403) break;
          if (attempt === 0) {
            const retryAfterHeader = response.headers.get('retry-after');
            const retryAfter = retryAfterHeader === null
              ? 750
              : Number(retryAfterHeader) * 1000;
            await delay(Math.min(3_000, Number.isFinite(retryAfter) ? retryAfter : 750));
          }
        }
      }

      throw publicError(`Gemini API request failed (HTTP ${lastStatus || 'network error'}). Check the configured model, API key, and quota.`);
    }
  };
}
