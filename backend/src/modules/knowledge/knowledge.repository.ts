import { pool } from '../../db/pool.js'
import type { KnowledgeArticle } from '../../types/index.js'
import { toVectorLiteral } from './embeddings.js'

export type RetrievedChunk = {
  title: string
  source: string
  sourceUrl: string | null
  content: string
  score: number
}

interface DocumentRow {
  id: string
  title: string
  source: string
  source_url: string | null
  content: string | null
}

function mapArticle(row: DocumentRow): KnowledgeArticle {
  return {
    id: row.id,
    title: row.title,
    source: row.source,
    content: row.content?.trim() || 'No content available for this document.',
    sourceUrl: row.source_url,
  }
}

const DOCUMENT_SELECT = `
  SELECT d.id, d.title, d.source, d.source_url,
         (
           SELECT string_agg(c.content, E'\n\n' ORDER BY c.chunk_index)
           FROM knowledge_chunks c
           WHERE c.document_id = d.id
         ) AS content
  FROM knowledge_documents d
`

export async function findDocumentByTitle(title: string): Promise<KnowledgeArticle | null> {
  const result = await pool.query<DocumentRow>(
    `${DOCUMENT_SELECT}
     WHERE lower(d.title) = lower($1)
     LIMIT 1`,
    [title],
  )
  const row = result.rows[0]
  return row ? mapArticle(row) : null
}

export async function findDocumentById(id: string): Promise<KnowledgeArticle | null> {
  const result = await pool.query<DocumentRow>(
    `${DOCUMENT_SELECT}
     WHERE d.id = $1
     LIMIT 1`,
    [id],
  )
  const row = result.rows[0]
  return row ? mapArticle(row) : null
}

export async function searchChunksByEmbedding(
  embedding: number[],
  limit: number,
): Promise<RetrievedChunk[]> {
  const result = await pool.query<{
    title: string
    source: string
    source_url: string | null
    content: string
    score: number
  }>(
    `SELECT d.title, d.source, d.source_url, c.content,
            (1 - (c.embedding <=> $1::vector))::float8 AS score
     FROM knowledge_chunks c
     JOIN knowledge_documents d ON d.id = c.document_id
     ORDER BY c.embedding <=> $1::vector
     LIMIT $2`,
    [toVectorLiteral(embedding), limit],
  )
  return result.rows.map((row) => ({
    title: row.title,
    source: row.source,
    sourceUrl: row.source_url,
    content: row.content,
    score: Number(row.score),
  }))
}

export async function searchChunksByKeywords(
  terms: string[],
  limit: number,
): Promise<RetrievedChunk[]> {
  if (terms.length === 0) return []

  const likeFilters = terms.map((_, index) => {
    const n = index + 1
    return `(d.title ILIKE '%' || $${n} || '%' OR c.content ILIKE '%' || $${n} || '%')`
  })
  const scoreParts = terms.map((_, index) => {
    const n = index + 1
    return `(CASE WHEN d.title ILIKE '%' || $${n} || '%' THEN 0.35 ELSE 0 END
            + CASE WHEN c.content ILIKE '%' || $${n} || '%' THEN 0.2 ELSE 0 END)`
  })

  const result = await pool.query<{
    title: string
    source: string
    source_url: string | null
    content: string
    score: number
  }>(
    `SELECT d.title, d.source, d.source_url, c.content,
            (${scoreParts.join(' + ')})::float8 AS score
     FROM knowledge_chunks c
     JOIN knowledge_documents d ON d.id = c.document_id
     WHERE ${likeFilters.join(' OR ')}
     ORDER BY score DESC
     LIMIT $${terms.length + 1}`,
    [...terms, limit],
  )

  return result.rows.map((row) => ({
    title: row.title,
    source: row.source,
    sourceUrl: row.source_url,
    content: row.content,
    score: Number(row.score),
  }))
}
