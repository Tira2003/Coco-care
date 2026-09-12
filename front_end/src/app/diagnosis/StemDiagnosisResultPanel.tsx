import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Info,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Trees,
} from 'lucide-react'
import { motion } from 'motion/react'
import type { DiagnosisResult } from '@/types'
import { formatPercentage, toPercentageNumber } from '@/app/diagnosis/formatPercentage'

const BAR_COLORS = [
  'from-emerald-500 to-emerald-600',
  'from-lime-500 to-lime-600',
  'from-sky-500 to-sky-600',
  'from-amber-500 to-amber-600',
  'from-orange-500 to-orange-600',
  'from-stone-500 to-stone-600',
  'from-teal-500 to-teal-600',
]

function SymptomChip({ text, index }: { text: string; index: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50/80 px-3 py-1.5 text-xs font-medium text-amber-900"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      {text}
    </motion.span>
  )
}

function CauseRow({ text, index }: { text: string; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
        {index + 1}
      </span>
      <span className="text-sm leading-relaxed text-slate-700">{text}</span>
    </motion.li>
  )
}

function PreventionStep({ text, index }: { text: string; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="group flex items-start gap-3"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2d5f2e] text-xs font-bold text-white shadow-sm">
        {index + 1}
      </span>
      <span className="pt-0.5 text-sm leading-relaxed text-slate-700 group-hover:text-[#1a2e1a]">
        {text}
      </span>
    </motion.li>
  )
}

/**
 * Result UI for stem, bud, and fruit questionnaires — matches leaf disease prediction style.
 */
export function StemDiagnosisResultPanel({ result }: { result: DiagnosisResult }) {
  const d = result.stemDetail ?? result.budDetail ?? result.fruitDetail
  if (!d) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Diagnosis completed, but detailed report was not returned. Summary: {result.finalResult} (
        {formatPercentage(result.confidence)}% match).
      </div>
    )
  }

  const topMatch = d.inconclusive
    ? d.rankings[0]?.matchScore ?? Math.round(toPercentageNumber(result.confidence))
    : d.matchScore
  const topScoreFraction = topMatch / 100
  const topName = result.finalResult || d.rankings[0]?.name || 'Assessment'
  const matchBand = d.inconclusive ? 'Needs more signals' : d.matchBandLabel

  const leafLinkText =
    result.category === 'fruit' || d.code === 'CC'
      ? 'The main caterpillar infestation is usually on the leaves — open the'
      : 'If damage is mainly on leaflet surfaces rather than the spear or bud, try the'

  const rankings =
    d.rankings.length > 0
      ? d.rankings
      : [{ code: 'top', name: topName, matchScore: topMatch, category: d.typeLabel }]

  return (
    <div className="space-y-5">
      {/* —— Same card style as leaf Disease Predictions —— */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-2xl border border-green-100/80 bg-white p-5 shadow-md ring-1 ring-green-50 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#1a2e1a]">Disease Predictions</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Symptom questionnaire match scores
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#2d5f2e]">
            <Trees className="h-4 w-4" />
          </div>
        </div>

        <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2e1a] via-[#2d5f2e] to-[#3d7a3f] px-5 py-4 text-white shadow-inner">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Most likely condition
            </div>
            <div className="text-2xl font-bold leading-snug">{topName}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
                {formatPercentage(topScoreFraction)}% confidence
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
                {matchBand}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-emerald-100/80">
              Not a confirmed disease — awaiting agriculture officer verification when needed.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {rankings.map((r, index) => {
            const percentValue = Math.min(100, Math.max(0, r.matchScore))
            const isTop = index === 0
            return (
              <div
                key={r.code}
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
                    {r.name}
                  </span>
                  <span
                    className={`shrink-0 text-sm font-bold tabular-nums ${
                      isTop ? 'text-[#2d5f2e]' : 'text-gray-600'
                    }`}
                  >
                    {formatPercentage(percentValue / 100)}%
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
        <p className="mt-3 text-xs text-gray-500">
          These are expert-rule symptom match scores, not lab probabilities.
        </p>
      </motion.div>

      {/* Alerts */}
      {result.officerAlert ? (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{result.officerAlert}</span>
        </div>
      ) : null}
      {d.rbbCrossCheckRpw ? (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Black beetle damage can leave entry points for Red Palm Weevil — also check for holes,
            viscous fluid, crunching sounds, and cocoons.
          </span>
        </div>
      ) : null}
      {d.suggestLeafModule ? (
        <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <Leaf className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {leafLinkText}{' '}
            <a href="/app/disease-detection/leaves" className="font-semibold underline">
              Leaf diagnosis module
            </a>
            .
          </span>
        </div>
      ) : null}

      {/* —— Detail body (matches leaf; no duplicate dark “Diagnosis result” header) —— */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="overflow-hidden rounded-3xl border border-green-100/80 bg-white shadow-xl shadow-green-900/5"
      >
        <div className="space-y-6 p-6 sm:p-8">
          <section className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50/80 via-white to-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d5f2e] text-white shadow-sm">
                <BookOpen className="h-4 w-4" />
              </div>
              <h4 className="text-base font-semibold text-[#1a2e1a]">About this condition</h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 sm:text-[15px]">{d.cause}</p>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            {d.evidence.length > 0 ? (
              <section className="rounded-2xl border border-amber-100/80 bg-amber-50/30 p-5">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <h4 className="text-base font-semibold text-[#1a2e1a]">
                    Why COCO CARE predicted this
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.evidence.map((item, i) => (
                    <SymptomChip key={item} text={item} index={i} />
                  ))}
                </div>
              </section>
            ) : null}

            {d.riskFactors.length > 0 ? (
              <section className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-600 text-white shadow-sm">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <h4 className="text-base font-semibold text-[#1a2e1a]">Risk factors</h4>
                </div>
                <ul className="space-y-2">
                  {d.riskFactors.map((item, i) => (
                    <CauseRow key={item} text={item} index={i} />
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {d.whatHappensIfWorse ? (
            <section className="rounded-2xl border border-red-100 bg-red-50/40 px-5 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700">
                If left untreated
              </p>
              <p className="text-sm leading-relaxed text-red-900/90">{d.whatHappensIfWorse}</p>
            </section>
          ) : null}

          {d.prevention.length > 0 ? (
            <section className="rounded-2xl border border-green-200/80 bg-gradient-to-br from-green-50 to-emerald-50/30 p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d5f2e] text-white shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#1a2e1a]">Prevention & care</h4>
                  <p className="text-xs text-slate-500">Steps to protect your plantation</p>
                </div>
              </div>
              <ol className="space-y-3">
                {d.prevention.map((step, i) => (
                  <PreventionStep key={step} text={step} index={i} />
                ))}
              </ol>
            </section>
          ) : null}

          {d.management.length > 0 ? (
            <section className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <h4 className="text-base font-semibold text-[#1a2e1a]">Management</h4>
              </div>
              <ol className="space-y-3">
                {d.management.map((step, i) => (
                  <PreventionStep key={step} text={step} index={i} />
                ))}
              </ol>
            </section>
          ) : null}

          {d.whatToDoNow ? (
            <section className="rounded-2xl border-2 border-dashed border-[#2d5f2e]/30 bg-[#2d5f2e]/5 p-5 sm:p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2d5f2e]">
                What you should do now
              </p>
              <ul className="space-y-2.5">
                {d.whatToDoNow
                  .split(/[.;]\s+/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((action) => (
                    <li key={action} className="flex items-start gap-2.5 text-sm text-[#1a2e1a]">
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#2d5f2e]" />
                      <span className="leading-relaxed">
                        {action.endsWith('.') ? action : `${action}.`}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}

          {result.secondaryConditions && result.secondaryConditions.length > 0 ? (
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h4 className="mb-2 text-sm font-semibold text-[#1a2e1a]">Also consider</h4>
              <div className="flex flex-wrap gap-2">
                {result.secondaryConditions.map((s, i) => (
                  <SymptomChip key={s} text={s} index={i} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="flex gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{d.disclaimer}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
