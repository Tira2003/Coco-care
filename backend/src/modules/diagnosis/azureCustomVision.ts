import { env } from '../../config/env.js'
import { serviceUnavailable } from '../../utils/errors.js'
import type { AzurePrediction } from './leafFusion.js'

type AzureResponse = {
  predictions?: Array<{ tagName?: string; probability?: number }>
  error?: { code?: string; message?: string }
  message?: string
}

function toImageAndUrl(base: string) {
  const normalized = base.replace(/\/$/, '')
  if (normalized.endsWith('/url')) {
    return { urlEndpoint: normalized, imageEndpoint: normalized.replace(/\/url$/, '/image') }
  }
  if (normalized.endsWith('/image')) {
    return { urlEndpoint: normalized.replace(/\/image$/, '/url'), imageEndpoint: normalized }
  }
  return { urlEndpoint: `${normalized}/url`, imageEndpoint: `${normalized}/image` }
}

function predictionEndpoints() {
  const configured = env.azureCvPredictionUrl.trim()
  if (!configured) {
    throw serviceUnavailable('Leaf classification is not configured.')
  }
  return toImageAndUrl(configured)
}

function trainingFallbackEndpoints() {
  const training = env.azureCvEndpoint.trim().replace(/\/$/, '')
  const predictionUrl = env.azureCvPredictionUrl.trim()
  const match = predictionUrl.match(/\/Prediction\/([^/]+)\/classify\/iterations\/([^/]+)/i)
  if (!training || !match) return null
  const projectId = match[1]
  const iteration = match[2]
  return toImageAndUrl(
    `${training}/customvision/v3.0/Prediction/${projectId}/classify/iterations/${iteration}/image`,
  )
}

function decodeDataUrl(imageUrl: string) {
  const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null
  return {
    contentType: match[1] ?? 'application/octet-stream',
    buffer: Buffer.from(match[2] ?? '', 'base64'),
  }
}

async function postPrediction(url: string, body: Uint8Array | string, contentType: string) {
  const key = env.azureCvKey.trim()
  if (!key) {
    throw serviceUnavailable('Leaf classification is not configured.')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Prediction-Key': key,
      'Content-Type': contentType,
    },
    body: body as BodyInit,
  })

  const payload = (await response.json().catch(() => null)) as AzureResponse | null
  return { ok: response.ok, status: response.status, payload }
}

async function classifyWithEndpoints(
  endpoints: { urlEndpoint: string; imageEndpoint: string },
  imageUrl: string,
) {
  const dataUrl = decodeDataUrl(imageUrl)
  return dataUrl
    ? postPrediction(endpoints.imageEndpoint, new Uint8Array(dataUrl.buffer), 'application/octet-stream')
    : postPrediction(endpoints.urlEndpoint, JSON.stringify({ Url: imageUrl }), 'application/json')
}

export async function classifyLeafImage(imageUrl: string): Promise<AzurePrediction[]> {
  const primary = await classifyWithEndpoints(predictionEndpoints(), imageUrl)
  let used = primary

  if (!primary.ok && (primary.status === 401 || primary.status === 403)) {
    const fallback = trainingFallbackEndpoints()
    if (fallback) {
      used = await classifyWithEndpoints(fallback, imageUrl)
    }
  }

  if (!used.ok) {
    const detail =
      used.payload?.error?.message ||
      used.payload?.message ||
      `Azure Custom Vision returned ${used.status}`
    if (used.status === 401 || used.status === 403) {
      throw serviceUnavailable('Azure Custom Vision rejected the prediction key. Check AZURE_CV_KEY.')
    }
    throw serviceUnavailable(detail)
  }

  const predictions = (used.payload?.predictions ?? [])
    .filter((item) => item.tagName)
    .map((item) => ({
      tagName: String(item.tagName),
      probability: Number(item.probability ?? 0),
    }))

  if (predictions.length === 0) {
    throw serviceUnavailable('The ML model did not return any disease predictions for that image.')
  }

  return predictions
}
