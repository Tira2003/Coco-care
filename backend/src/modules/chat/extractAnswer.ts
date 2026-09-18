import type { RetrievedChunk } from '../knowledge/knowledge.repository.js'

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'i',
  'in', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'what', 'when', 'where',
  'which', 'who', 'why', 'with', 'your', 'my', 'me', 'please', 'tell', 'any',
  'about', 'can', 'you', 'palm', 'tree', 'trees', 'coconut',
])

const GENERIC_TERMS = new Set([
  'disease', 'pest', 'control', 'treat', 'treatment', 'cure', 'prevent',
  'new', 'old', 'young', 'best',
])

const CRI_ALIASES: Array<{ pattern: RegExp; titleMatch: string }> = [
  { pattern: /\bbud\s*rot\b/i, titleMatch: 'Bud Rot' },
  { pattern: /\bleaf\s*wilt\b|\bweligama\b/i, titleMatch: 'Leaf Wilt' },
  { pattern: /\bleaf\s*miner\b|\bcumingi\b/i, titleMatch: 'Leaf Miner' },
  { pattern: /\bred\s*weevil\b/i, titleMatch: 'Red Weevil' },
  { pattern: /\bblack\s*beetle\b/i, titleMatch: 'Black Beetle' },
  { pattern: /\bcaterpillar\b/i, titleMatch: 'Caterpillar' },
  { pattern: /\bdolomite\b/i, titleMatch: 'Seedlings' },
  { pattern: /\bseedling\b.*\bfertili[sz]er|\bfertili[sz]er\b.*\bseedling/i, titleMatch: 'Seedlings' },
  { pattern: /\badult\b.*\bfertili[sz]er|\bfertili[sz]er\b.*\badult\b/i, titleMatch: 'Adult Coconut' },
  { pattern: /\borganic\s+fertili[sz]er/i, titleMatch: 'Organic Fertilizers' },
  { pattern: /\bbasal\b/i, titleMatch: 'Basal Fertilizer' },
  { pattern: /\bnutrient\b/i, titleMatch: 'Nutrient Requirements' },
]

export function tokenizeQuestion(question: string) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
}

function wantsTreatment(question: string) {
  return /\b(treat|treatment|control|cure|prevent|manage|spray|fungicide|dose|how much)\b/i.test(
    question,
  )
}

function isControlChunk(chunk: RetrievedChunk) {
  return / — Control|Control Measures|Preventive measures|Bordeaux|fungicide|remove them from the field|cut and burnt/i.test(
    chunk.content,
  )
}

function preferControlChunks(question: string, chunks: RetrievedChunk[]) {
  if (!wantsTreatment(question)) return chunks
  const control = chunks.filter(isControlChunk)
  if (control.length === 0) return chunks
  const rest = chunks.filter((chunk) => !control.includes(chunk))
  return [...control, ...rest]
}

export function criGapMessage(question: string): string | null {
  if (
    /\b(water(?:ing)?|irrigat(?:e|ion)|drought)\b/i.test(question) &&
    !/\b(bordeaux|fungicide|dilut|mixture|spray mix)\b/i.test(question)
  ) {
    return 'CRI circulars in Coco Care do not give a watering schedule or how much water to give new coconut trees. They only note that planting pits should not stay waterlogged, and that fertilizer is applied when the soil is moist after monsoon rain. For irrigation amounts in your area, ask a Coconut Development Officer.'
  }
  return null
}

export function chunksCoverQuestion(question: string, chunks: RetrievedChunk[]): boolean {
  if (chunks.length === 0) return false
  const distinctive = tokenizeQuestion(question).filter(
    (term) => !GENERIC_TERMS.has(term) && term.length > 3,
  )
  if (distinctive.length === 0) return true
  const blob = chunks.map((chunk) => `${chunk.title}\n${chunk.content}`).join('\n').toLowerCase()
  const hits = distinctive.filter((term) => blob.includes(term))
  return hits.length >= Math.ceil(distinctive.length * 0.5)
}

export function selectChunksForQuestion(question: string, chunks: RetrievedChunk[]): RetrievedChunk[] {
  if (chunks.length === 0) return []

  const alias = CRI_ALIASES.find((item) => item.pattern.test(question))
  if (alias) {
    const matched = chunks.filter((chunk) =>
      chunk.title.toLowerCase().includes(alias.titleMatch.toLowerCase()),
    )
    if (matched.length > 0) {
      return preferControlChunks(question, matched).slice(0, 6)
    }
  }

  const terms = tokenizeQuestion(question)
  const distinctive = terms.filter((term) => !GENERIC_TERMS.has(term))
  const byTitle = new Map<string, { score: number; chunks: RetrievedChunk[] }>()

  for (const chunk of chunks) {
    const title = chunk.title.toLowerCase()
    const titleHits = distinctive.filter((term) => title.includes(term)).length
    const genericHits = terms.filter((term) => GENERIC_TERMS.has(term) && title.includes(term)).length
    const score = titleHits * 3 + genericHits + chunk.score
    const entry = byTitle.get(chunk.title) ?? { score: 0, chunks: [] }
    entry.chunks.push(chunk)
    entry.score = Math.max(entry.score, score)
    byTitle.set(chunk.title, entry)
  }

  const ranked = [...byTitle.entries()].sort((a, b) => b[1].score - a[1].score)
  const top = ranked[0]
  if (!top) return []

  const runnerUp = ranked[1]
  const closeSecond =
    runnerUp &&
    distinctive.length > 0 &&
    runnerUp[1].score >= top[1].score * 0.9 &&
    runnerUp[0] !== top[0]

  const chosen = closeSecond ? [...top[1].chunks, ...runnerUp[1].chunks] : top[1].chunks
  return preferControlChunks(question, chosen).slice(0, 6)
}

function isMetaOrHeading(line: string) {
  const text = line.replace(/^[-•]\s*/, '').trim()
  if (!text) return true
  if (/^(Source ID|Category|Title|PDF)\b/i.test(text)) return true
  if (/ — (Symptoms|Control|Preventive measures|Pest Description|Control Measures)\s*$/i.test(text)) {
    return true
  }
  if (text.length < 90 && /and its Control|Recommendations for/.test(text) && !/[.]/.test(text)) {
    return true
  }
  return false
}

function linesFromChunk(content: string) {
  return content
    .split(/\n+/)
    .map((line) => line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line.length > 24 && !isMetaOrHeading(line))
}

export function extractAnswer(question: string, chunks: RetrievedChunk[]) {
  const selected = selectChunksForQuestion(question, chunks)
  const working = selected.length > 0 ? selected : chunks
  const titles = [...new Set(working.map((chunk) => chunk.title))]

  const sections = titles.map((title) => {
    const group = working.filter((chunk) => chunk.title === title)
    const seen = new Set<string>()
    const bullets: string[] = []
    for (const line of group.flatMap((chunk) => linesFromChunk(chunk.content))) {
      const key = line.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      bullets.push(line)
      if (bullets.length >= 5) break
    }
    return { title, bullets }
  }).filter((section) => section.bullets.length > 0)

  if (sections.length === 0) {
    return {
      body: 'I could not find this in the CRI advisory circulars. Please ask an agricultural officer if the palm looks worse.',
      sourceTitle: null as string | null,
    }
  }

  const named = question.match(/\b((?:leaf|bud|stem|root)\s+rot|leaf wilt|leaf miner|red weevil|black beetle|caterpillar)\b/i)
  const namedDisease = named?.[1]?.toLowerCase()
  const titlesLower = titles.map((title) => title.toLowerCase())
  const exactHit = namedDisease
    ? titlesLower.some((title) => title.includes(namedDisease.replace(/\s+/g, ' ')))
    : true

  const formatted = sections
    .map((section) => `${section.title}\n${section.bullets.map((bullet) => `• ${bullet}`).join('\n')}`)
    .join('\n\n')

  const body =
    namedDisease && !exactHit
      ? `CRI circulars do not list a coconut disease called "${namedDisease}". The closest official advisories are:\n\n${formatted}`
      : formatted

  return {
    body,
    sourceTitle: sections.length === 1 ? sections[0]!.title : sections[0]!.title,
  }
}

export function toPlainChatText(text: string) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[^\w/])\*(?!\s)([^*\n]+?)\*(?=$|[^\w])/g, '$1$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^[ \t]*[-*+]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function withSource(body: string, sourceTitle: string | null) {
  const trimmed = toPlainChatText(body)
  if (!sourceTitle) return trimmed
  if (/\n\nSource:/i.test(trimmed)) return trimmed
  return `${trimmed}\n\nSource: ${sourceTitle}`
}
