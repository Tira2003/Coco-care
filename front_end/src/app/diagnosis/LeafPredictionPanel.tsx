import { CheckCircle2, Leaf, Loader2, TrendingUp } from 'lucide-react'
import { motion } from 'motion/react'
import type { DiagnosisResult } from '@/types'
import { LEAF_PANEL_BASE } from '@/app/diagnosis/panelLayout'
import { formatPercentage, toPercentageNumber } from '@/app/diagnosis/formatPercentage'
import {
  LEAF_CONFIDENCE_REFINE_THRESHOLD,
  getMatchLevelLabel,
} from '@/app/diagnosis/leafSymptomQuestionnaire'

const BAR_COLORS = [
  'from-emerald-500 to-emerald-600',
  'from-lime-500 to-lime-600',
  'from-sky-500 to-sky-600',
  'from-amber-500 to-amber-600',
  'from-orange-500 to-orange-600',
  'from-stone-500 to-stone-600',
  'from-teal-500 to-teal-600',
]

export function LeafPredictionPanel({
  result,
  scanning,
}: {
  result: DiagnosisResult | null
  scanning: boolean
}) {
  if (scanning) {
    return (
      <div className={`${LEAF_PANEL_BASE} items-center justify-center text-center`}>
        <div className="relative mb-5">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-40" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <Loader2 className="h-8 w-8 animate-spin text-[#2d5f2e]" />
          </div>
        </div>
        <h3 className="mb-1 text-xl font-semibold text-gray-900">Analyzing Leaf Image</h3>
        <p className="text-sm text-gray-500">Running ML disease classification model…</p>
      </div>
    )
  }

  if (!result?.predictions?.length) {
    return (
      <div
        className={`${LEAF_PANEL_BASE} items-center justify-center bg-gradient-to-b from-green-50/40 to-white text-center`}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-[#2d5f2e]">
          <TrendingUp className="h-7 w-7" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-[#1a2e1a]">Disease Predictions</h3>
        <p className="max-w-xs text-sm leading-relaxed text-gray-500">
          Upload a leaf image and run the ML model to see probability scores for each disease.
        </p>
      </div>
    )
  }

  const sorted = [...result.predictions].sort((a, b) => b.probability - a.probability)
  const top = sorted[0]
  const matchLabel = getMatchLevelLabel(result.matchLevel, result.confidence)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={LEAF_PANEL_BASE}
    >
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#1a2e1a]">Disease Predictions</h2>
          <p className="mt-0.5 text-sm text-gray-500">ML model probability scores</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#2d5f2e]">
          <Leaf className="h-4 w-4" />
        </div>
      </div>

      {top ? (
        <div className="relative mb-4 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2e1a] via-[#2d5f2e] to-[#3d7a3f] px-5 py-4 text-white shadow-inner">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Most likely condition
            </div>
            <div className="text-2xl font-bold leading-snug">{result.finalResult || top.label}</div>
            {result.detectedEvidence ? (
              <p className="mt-2 text-sm text-emerald-100">{result.detectedEvidence}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
                {formatPercentage(result.confidence)}% confidence
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
                {matchLabel}
              </span>
            </div>
            {result.confidence < LEAF_CONFIDENCE_REFINE_THRESHOLD ? (
              <p className="mt-2 text-xs text-amber-100">
                Complete the symptom questionnaire below to recalculate percentage outputs.
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-emerald-100/80">
              Not a confirmed disease — awaiting agriculture officer verification when needed.
            </p>
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5">
        {sorted.map((prediction, index) => {
          const percentValue = toPercentageNumber(prediction.probability)
          const percent = formatPercentage(prediction.probability)
          const isTop = prediction.label === (result.finalResult || top?.label)

          return (
            <div
              key={prediction.label}
              className={`rounded-lg px-3 py-2.5 transition-colors ${
                isTop ? 'bg-green-50/80 ring-1 ring-green-100' : 'bg-gray-50/60'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span
                  className={`text-sm font-medium leading-tight ${
                    isTop ? 'text-[#1a2e1a]' : 'text-gray-700'
                  }`}
                >
                  {prediction.label}
                </span>
                <span
                  className={`shrink-0 text-sm font-bold tabular-nums ${
                    isTop ? 'text-[#2d5f2e]' : 'text-gray-600'
                  }`}
                >
                  {percent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/80">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(percentValue, 2)}%` }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[index % BAR_COLORS.length]}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
