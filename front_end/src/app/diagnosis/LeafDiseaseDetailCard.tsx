import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'motion/react'
import { getLeafDiseaseInfo } from '@/app/diagnosis/leafDiseaseInfo'

function buildDescriptionParagraphs(
  description: string[],
  causalOrganism?: string,
): string[] {
  if (!causalOrganism) return description
  const organism = causalOrganism.replace(/\.$/, '')
  return [...description, `It is caused by ${organism.charAt(0).toLowerCase()}${organism.slice(1)}.`]
}

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

export function LeafDiseaseDetailCard({ diseaseName }: { diseaseName: string }) {
  const info = getLeafDiseaseInfo(diseaseName)
  if (!info) return null

  const descriptionParagraphs = buildDescriptionParagraphs(info.description, info.causalOrganism)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="overflow-hidden rounded-3xl border border-green-100/80 bg-white shadow-xl shadow-green-900/5"
    >
      <div className="space-y-6 p-6 sm:p-8">
        {/* Description */}
        <section className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50/80 via-white to-white p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d5f2e] text-white shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <h4 className="text-base font-semibold text-[#1a2e1a]">About this condition</h4>
          </div>
          <div className="space-y-3">
            {descriptionParagraphs.map((paragraph, i) => (
              <p
                key={paragraph.slice(0, 48)}
                className={`text-sm leading-relaxed sm:text-[15px] ${
                  info.causalOrganism && i === descriptionParagraphs.length - 1
                    ? 'border-l-2 border-[#2d5f2e]/30 pl-4 text-slate-600'
                    : 'text-slate-700'
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Symptoms & Causes grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-amber-100/80 bg-amber-50/30 p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h4 className="text-base font-semibold text-[#1a2e1a]">Symptoms to look for</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {info.symptoms.map((symptom, i) => (
                <SymptomChip key={symptom} text={symptom} index={i} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-600 text-white shadow-sm">
                <Stethoscope className="h-4 w-4" />
              </div>
              <h4 className="text-base font-semibold text-[#1a2e1a]">Common causes</h4>
            </div>
            <ul className="space-y-2">
              {info.causes.map((cause, i) => (
                <CauseRow key={cause} text={cause} index={i} />
              ))}
            </ul>
          </section>
        </div>

        {/* Disease progression timeline */}
        {info.diseaseProgression?.length ? (
          <section className="rounded-2xl border border-blue-100/80 bg-blue-50/20 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h4 className="text-base font-semibold text-[#1a2e1a]">How it progresses</h4>
            </div>
            <div className="relative space-y-0">
              {info.diseaseProgression.map((stage, stageIndex) => (
                <div key={stage.stage} className="relative flex gap-4 pb-6 last:pb-0">
                  {stageIndex < info.diseaseProgression!.length - 1 ? (
                    <div className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 bg-sky-200" />
                  ) : null}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white shadow-md ring-4 ring-blue-50">
                    {stageIndex + 1}
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl border border-white/80 bg-white/70 px-4 py-3 shadow-sm">
                    <p className="mb-2 text-sm font-semibold text-sky-900">{stage.stage}</p>
                    <ul className="space-y-1.5">
                      {stage.symptoms.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Impact strip */}
        {info.impact?.length ? (
          <section className="rounded-2xl border border-red-100 bg-red-50/40 px-5 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700">
              If left untreated
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {info.impact.map((item) => (
                <span key={item} className="text-sm text-red-800/90">
                  · {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {/* Prevention */}
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
            {info.prevention.map((step, i) => (
              <PreventionStep key={step} text={step} index={i} />
            ))}
          </ol>
        </section>

        {/* Recommended actions (WCLWD stages) */}
        {info.recommendedAction?.length ? (
          <section className="rounded-2xl border-2 border-dashed border-[#2d5f2e]/30 bg-[#2d5f2e]/5 p-5 sm:p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2d5f2e]">
              What you should do now
            </p>
            <ul className="space-y-2.5">
              {info.recommendedAction.map((action) => (
                <li key={action} className="flex items-start gap-2.5 text-sm text-[#1a2e1a]">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#2d5f2e]" />
                  <span className="leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </motion.div>
  )
}
