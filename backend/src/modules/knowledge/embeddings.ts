import { env } from '../../config/env.js'

export async function embedQuery(text: string): Promise<number[] | null> {
  const apiKey = env.geminiApiKey.trim()
  if (!apiKey || !env.geminiEmbeddingEnabled) return null

  const model = env.geminiEmbeddingModel.trim() || 'gemini-embedding-001'
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent`,
  )
  url.searchParams.set('key', apiKey)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_QUERY',
      outputDimensionality: env.geminiEmbeddingDimensions || 768,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('Gemini embedding failed', response.status, detail.slice(0, 400))
    return null
  }

  const payload = (await response.json()) as {
    embedding?: { values?: number[] }
  }
  const values = payload.embedding?.values
  if (!values?.length) return null
  return values
}

export function toVectorLiteral(values: number[]) {
  return `[${values.map((value) => Number(value.toFixed(8))).join(',')}]`
}
