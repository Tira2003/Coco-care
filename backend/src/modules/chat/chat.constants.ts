export const CHAT_WELCOME_MESSAGE =
  'Hello! I am Coco AI. Ask me anything about coconut farming, diseases, or fertilizer.'

export function isWelcomeMessage(role: string, content: string) {
  return role === 'assistant' && content.trim() === CHAT_WELCOME_MESSAGE
}
