import { pool } from '../../db/pool.js'
import type { ChatConversation, ChatMessage } from '../../types/index.js'
import { CHAT_WELCOME_MESSAGE, isWelcomeMessage } from './chat.constants.js'

interface ConversationRow {
  id: string
  title: string
  created_at: Date
  updated_at: Date
}

interface MessageRow {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: Date
}

function mapConversation(row: ConversationRow): ChatConversation {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at.toISOString(),
  }
}

export async function listConversations(userId: string): Promise<ChatConversation[]> {
  const result = await pool.query<ConversationRow>(
    `SELECT id, title, created_at, updated_at
     FROM chat_conversations
     WHERE user_id = $1
     ORDER BY updated_at DESC
     LIMIT 50`,
    [userId],
  )
  return result.rows.map(mapConversation)
}

export async function createConversation(userId: string): Promise<ChatConversation> {
  const result = await pool.query<ConversationRow>(
    `INSERT INTO chat_conversations (user_id, title)
     VALUES ($1, 'New conversation')
     RETURNING id, title, created_at, updated_at`,
    [userId],
  )
  return mapConversation(result.rows[0]!)
}

export async function findConversationForUser(id: string, userId: string) {
  const result = await pool.query<ConversationRow>(
    `SELECT id, title, created_at, updated_at
     FROM chat_conversations
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [id, userId],
  )
  const row = result.rows[0]
  return row ? mapConversation(row) : null
}

export async function deleteConversationForUser(id: string, userId: string) {
  const result = await pool.query(
    `DELETE FROM chat_conversations
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  )
  return (result.rowCount ?? 0) > 0
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const result = await pool.query<MessageRow>(
    `SELECT id, conversation_id, role, content, created_at
     FROM chat_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId],
  )
  return result.rows.map(mapMessage)
}

export async function ensureWelcomeMessage(
  conversationId: string,
  userId: string,
  createdAt: string,
): Promise<ChatMessage[]> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `SELECT id FROM chat_conversations WHERE id = $1 FOR UPDATE`,
      [conversationId],
    )

    await client.query(
      `WITH keep AS (
         SELECT id
         FROM chat_messages
         WHERE conversation_id = $1
           AND role = 'assistant'
           AND content = $2
         ORDER BY created_at ASC, id ASC
         LIMIT 1
       )
       DELETE FROM chat_messages AS m
       USING keep
       WHERE m.conversation_id = $1
         AND m.role = 'assistant'
         AND m.content = $2
         AND m.id <> keep.id`,
      [conversationId, CHAT_WELCOME_MESSAGE],
    )

    const existing = await client.query<MessageRow>(
      `SELECT id, conversation_id, role, content, created_at
       FROM chat_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId],
    )

    if (!existing.rows.some((row) => isWelcomeMessage(row.role, row.content))) {
      await client.query(
        `INSERT INTO chat_messages (conversation_id, user_id, role, content, created_at)
         SELECT $1, $2, 'assistant', $3, $4::timestamptz
         WHERE NOT EXISTS (
           SELECT 1
           FROM chat_messages
           WHERE conversation_id = $1
             AND role = 'assistant'
             AND content = $3
         )`,
        [conversationId, userId, CHAT_WELCOME_MESSAGE, createdAt],
      )
    }

    const result = await client.query<MessageRow>(
      `SELECT id, conversation_id, role, content, created_at
       FROM chat_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId],
    )
    await client.query('COMMIT')
    return result.rows.map(mapMessage)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function insertMessage(input: {
  conversationId: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}): Promise<ChatMessage> {
  const result = await pool.query<MessageRow>(
    input.createdAt
      ? `INSERT INTO chat_messages (conversation_id, user_id, role, content, created_at)
         VALUES ($1, $2, $3, $4, $5::timestamptz)
         RETURNING id, conversation_id, role, content, created_at`
      : `INSERT INTO chat_messages (conversation_id, user_id, role, content)
         VALUES ($1, $2, $3, $4)
         RETURNING id, conversation_id, role, content, created_at`,
    input.createdAt
      ? [input.conversationId, input.userId, input.role, input.content, input.createdAt]
      : [input.conversationId, input.userId, input.role, input.content],
  )
  return mapMessage(result.rows[0]!)
}

export async function touchConversation(id: string, title?: string) {
  if (title) {
    await pool.query(
      `UPDATE chat_conversations
       SET title = $2, updated_at = now()
       WHERE id = $1`,
      [id, title],
    )
    return
  }
  await pool.query(
    `UPDATE chat_conversations
     SET updated_at = now()
     WHERE id = $1`,
    [id],
  )
}
