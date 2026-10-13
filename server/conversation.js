export const MAX_MESSAGES = 40;
export const MAX_MESSAGE_LENGTH = 8_000;

export function validateConversation(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    throw new Error(`Send between 1 and ${MAX_MESSAGES} conversation messages.`);
  }

  const validated = messages.map((message) => {
    if (
      typeof message !== 'object'
      || message === null
      || !['user', 'assistant'].includes(message.role)
      || typeof message.content !== 'string'
      || !message.content.trim()
      || message.content.length > MAX_MESSAGE_LENGTH
    ) {
      throw new Error(`Each message must have a user or assistant role and 1-${MAX_MESSAGE_LENGTH} characters.`);
    }

    return { role: message.role, content: message.content.trim() };
  });

  if (validated.at(-1).role !== 'user') {
    throw new Error('The latest conversation message must be from the user.');
  }

  return validated;
}
