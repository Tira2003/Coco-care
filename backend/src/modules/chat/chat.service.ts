import { env } from '../../config/env.js'
import { forbidden, notFound } from '../../utils/errors.js'
import type { ChatMessage } from '../../types/index.js'
import { embedQuery } from '../knowledge/embeddings.js'
import {
  searchChunksByEmbedding,
  searchChunksByKeywords,
  type RetrievedChunk,
} from '../knowledge/knowledge.repository.js'
import {
  createConversation,
  deleteConversationForUser,
  ensureWelcomeMessage,
  findConversationForUser,
  insertMessage,
  listConversations,
  touchConversation,
} from './chat.repository.js'
import { criGapMessage, chunksCoverQuestion, extractAnswer, selectChunksForQuestion, tokenizeQuestion, withSource } from './extractAnswer.js'
import { generateGroqAnswer } from './groq.js'
import type { SendChatInput } from './chat.schemas.js'

export function assertFarmer(role: string) {
  if (role !== 'farmer') throw forbidden('Farmer access required')
}

function conversationTitle(message: string) {
  const compact = message.replace(/\s+/g, ' ').trim()
  return compact.length <= 72 ? compact : `${compact.slice(0, 69).trim()}...`
}

async function retrieveChunks(question: string): Promise<RetrievedChunk[]> {
  const terms = tokenizeQuestion(question)
  const embedding = await embedQuery(question).catch(() => null)
  const vectorHits = embedding
    ? await searchChunksByEmbedding(embedding, env.ragTopK)
    : []
  const keywordHits = await searchChunksByKeywords(terms, env.ragTopK)

  const merged = new Map<string, RetrievedChunk>()
  for (const hit of [...keywordHits, ...vectorHits]) {
    const key = `${hit.title}::${hit.content.slice(0, 80)}`
    const existing = merged.get(key)
    if (!existing || hit.score > existing.score) merged.set(key, hit)
  }

  return [...merged.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, env.ragTopK)
}

export async function getConversations(userId: string) {
  return listConversations(userId)
}

export async function startConversation(userId: string) {
  const conversation = await createConversation(userId)
  await ensureWelcomeMessage(conversation.id, userId, conversation.createdAt)
  return conversation
}

export async function removeConversation(userId: string, conversationId: string) {
  const ok = await deleteConversationForUser(conversationId, userId)
  if (!ok) throw notFound('Conversation not found')
}

export async function getMessages(userId: string, conversationId: string) {
  const conversation = await findConversationForUser(conversationId, userId)
  if (!conversation) throw notFound('Conversation not found')
  return ensureWelcomeMessage(conversation.id, userId, conversation.createdAt)
}

export async function sendMessage(
  userId: string,
  input: SendChatInput,
): Promise<ChatMessage> {
  const conversation = await findConversationForUser(input.conversationId, userId)
  if (!conversation) throw notFound('Conversation not found')

  await ensureWelcomeMessage(conversation.id, userId, conversation.createdAt)

  await insertMessage({
    conversationId: conversation.id,
    userId,
    role: 'user',
    content: input.message,
  })

  if (conversation.title === 'New conversation') {
    await touchConversation(conversation.id, conversationTitle(input.message))
  } else {
    await touchConversation(conversation.id)
  }

  const gap = criGapMessage(input.message)
  if (gap) {
    return insertMessage({
      conversationId: conversation.id,
      userId,
      role: 'assistant',
      content: gap,
    })
  }

  const chunks = await retrieveChunks(input.message)
  const used = selectChunksForQuestion(input.message, chunks)
  const context = used.length > 0 ? used : chunks.slice(0, 4)

  if (!chunksCoverQuestion(input.message, context)) {
    return insertMessage({
      conversationId: conversation.id,
      userId,
      role: 'assistant',
      content:
        'I could not find this in the CRI advisory circulars loaded in Coco Care. Please ask an agricultural officer, or try a pest, disease, or fertilizer question from the CRI circulars.',
    })
  }

  let body: string
  let sourceTitle = context[0]?.title ?? null
  const groq = await generateGroqAnswer(input.message, context).catch(() => null)
  if (groq) {
    body = groq
  } else {
    const extracted = extractAnswer(input.message, context)
    body = extracted.body
    sourceTitle = extracted.sourceTitle
  }

  const content = withSource(body, sourceTitle)
  return insertMessage({
    conversationId: conversation.id,
    userId,
    role: 'assistant',
    content,
  })
}
