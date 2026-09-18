import { env } from '../../config/env.js'
import { badRequest, forbidden, notFound } from '../../utils/errors.js'
import type { DiagnosisResult } from '../../types/index.js'
import { findFarmByIdForUser } from '../auth/auth.repository.js'
import { classifyLeafImage } from './azureCustomVision.js'
import type { DiagnosisBody } from './diagnosis.schemas.js'
import { insertDiseaseReport } from './diagnosis.repository.js'
import { fuseLeafPredictions } from './leafFusion.js'
import { scoreBud, scoreFruit, scoreStem } from './symptomScorer.js'

function autoStatus(confidence: number, finalResult: string): 'verified' | 'pending' {
  if (finalResult === 'Healthy Coconut Leaf' && confidence >= 0.8) return 'verified'
  if (confidence >= Math.max(env.fusionConfidenceThreshold, 0.9)) return 'verified'
  return 'pending'
}

export async function runDiagnosis(userId: string, input: DiagnosisBody): Promise<DiagnosisResult> {
  const farm = await findFarmByIdForUser(input.farmId, userId)
  if (!farm) throw notFound('Farm not found')

  if (input.category === 'leaves') {
    if (!input.imageUrl) {
      throw badRequest('Upload a coconut leaf image to run classification.')
    }
    const raw = await classifyLeafImage(input.imageUrl)
    const fused = fuseLeafPredictions(raw, input.symptoms)
    const status = autoStatus(fused.confidence, fused.finalResult)
    const officerAlert =
      fused.matchLevel !== 'high'
        ? 'Send this case to an agricultural officer if symptoms worsen or neighbouring palms are affected.'
        : undefined

    const id = await insertDiseaseReport({
      farmId: farm.id,
      userId,
      imageUrl: input.imageUrl,
      symptoms: input.symptoms,
      imageResult: fused.imageResult,
      symptomResult: fused.symptomResult,
      finalResult: fused.finalResult,
      confidence: fused.confidence,
      advice: fused.advice,
      status,
    })

    return {
      id,
      category: 'leaves',
      imageResult: fused.imageResult,
      symptomResult: fused.symptomResult,
      finalResult: fused.finalResult,
      confidence: fused.confidence,
      status,
      advice: fused.advice,
      predictions: fused.predictions,
      detectedEvidence: fused.detectedEvidence,
      matchLevel: fused.matchLevel,
      secondaryConditions: fused.secondaryConditions,
      officerAlert,
    }
  }

  const detail =
    input.category === 'stem'
      ? scoreStem(input.symptoms)
      : input.category === 'bud'
        ? scoreBud(input.symptoms)
        : scoreFruit(input.symptoms)

  const confidence = Math.round((detail.matchScore / 100) * 1000) / 1000
  const status = autoStatus(confidence, detail.rankings[0]?.name ?? detail.code)
  const id = await insertDiseaseReport({
    farmId: farm.id,
    userId,
    imageUrl: input.imageUrl,
    symptoms: input.symptoms,
    imageResult: 'Symptom questionnaire',
    symptomResult: detail.rankings[0]?.name ?? 'Inconclusive',
    finalResult: detail.rankings[0]?.name ?? 'Inconclusive',
    confidence,
    advice: detail.whatToDoNow,
    status,
  })

  const result: DiagnosisResult = {
    id,
    category: input.category,
    imageResult: 'Symptom questionnaire',
    symptomResult: detail.rankings[0]?.name ?? 'Inconclusive',
    finalResult: detail.rankings[0]?.name ?? 'Inconclusive',
    confidence,
    status,
    advice: detail.whatToDoNow,
    matchLevel: detail.matchScore >= 70 ? 'high' : detail.matchScore >= 45 ? 'moderate' : 'uncertain',
    secondaryConditions: detail.rankings.slice(1, 3).map((item) => item.name),
    officerAlert: detail.officerReferral
      ? 'Request an agricultural officer visit if this pattern continues or spreads.'
      : undefined,
  }

  if (input.category === 'stem') result.stemDetail = detail
  if (input.category === 'bud') result.budDetail = detail
  if (input.category === 'fruit') result.fruitDetail = detail
  return result
}

export function assertFarmer(role: string) {
  if (role !== 'farmer') throw forbidden('Farmer access required')
}
