import { env } from '../../config/env.js'
import type { RetrievedChunk } from '../knowledge/knowledge.repository.js'

const MODEL_FALLBACKS = [
  env.groqModel,
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
].filter((model, index, all) => model && all.indexOf(model) === index)

let workingModel: string | null = null

async function completeWithModel(
  model: string,
  question: string,
  excerpts: string,
): Promise<{ ok: true; content: string } | { ok: false; status: number }> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.groqApiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: 'system',
          content:
            'You are Coco Care, a Sri Lankan coconut farming assistant. Answer only from the CRI advisory excerpts. Use short paragraphs or plain dash bullets. Never use markdown: no asterisks, no **bold**, no headings, no code fences. If the excerpts do not directly answer the question, say that CRI circulars here do not cover it. Do not infer or invent advice from loosely related text, for example do not turn fertilizer moisture notes into a watering schedule. If the farmer names a disease that is not clearly the same as a CRI title, say CRI does not use that name, then briefly compare the closest circulars. Give practical control steps only from those circulars. Never merge two diseases into one treatment. Do not invent chemicals, doses, or treatments. Do not add a Source line.',
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nCRI excerpts:\n${excerpts}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('Groq chat failed', model, response.status, detail.slice(0, 400))
    return { ok: false, status: response.status }
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = payload.choices?.[0]?.message?.content?.trim()
  if (!content) return { ok: false, status: 200 }
  return { ok: true, content }
}

export async function generateGroqAnswer(
  question: string,
  chunks: RetrievedChunk[],
): Promise<string | null> {
  const apiKey = env.groqApiKey.trim()
  if (!apiKey || !env.groqEnabled || chunks.length === 0) return null

  const excerpts = chunks
    .slice(0, 6)
    .map((chunk, index) => `[${index + 1}] ${chunk.title}\n${chunk.content.slice(0, 1400)}`)
    .join('\n\n')

  const models = workingModel
    ? [workingModel, ...MODEL_FALLBACKS.filter((model) => model !== workingModel)]
    : MODEL_FALLBACKS

  for (const model of models) {
    const result = await completeWithModel(model, question, excerpts)
    if (result.ok) {
      workingModel = model
      return result.content
    }
    if (result.status !== 404) return null
  }

  return null
}
