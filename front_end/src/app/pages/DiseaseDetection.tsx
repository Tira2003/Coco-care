import { ArrowRight, Brain, ChevronRight, ClipboardList, Microscope, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { CATEGORY_META, DIAGNOSIS_CATEGORIES, getCategoryPath } from '@/app/diagnosis/categories'

export function DiseaseDetection() {
  const mlCount = DIAGNOSIS_CATEGORIES.filter((c) => CATEGORY_META[c].usesMl).length
  const symptomCount = DIAGNOSIS_CATEGORIES.length - mlCount

  return (
    <div className="mx-auto max-w-3xl pb-4 sm:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2e1a] via-[#2d5f2e] to-[#3d7a3f] px-4 py-6 text-white shadow-lg sm:mb-8 sm:rounded-3xl sm:px-10 sm:py-10"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Microscope className="h-3.5 w-3.5" />
            Step 1 · Choose diagnosis area
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Coconut Disease Diagnosis
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-green-100 sm:text-base">
            Select which part of your coconut palm shows symptoms. Leaf diseases are classified
            with our trained machine learning (ML) model; all other areas use a guided symptom
            questionnaire.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <Brain className="h-4 w-4 text-emerald-200" />
              <span>
                <strong className="font-semibold">{mlCount}</strong> ML-powered
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <ClipboardList className="h-4 w-4 text-amber-200" />
              <span>
                <strong className="font-semibold">{symptomCount}</strong> symptom-based
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative">
        <div
          aria-hidden
          className="absolute bottom-8 left-7 top-8 hidden w-px bg-gradient-to-b from-emerald-200 via-green-100 to-transparent sm:block"
        />

        <div className="flex flex-col gap-4">
          {DIAGNOSIS_CATEGORIES.map((category, index) => {
            const meta = CATEGORY_META[category]
            const Icon = meta.icon
            const isMl = meta.usesMl

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 * index }}
              >
                <Link
                  to={getCategoryPath(category)}
                  className={`group relative block overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                    isMl
                      ? 'border-emerald-200 shadow-md shadow-emerald-100/60 ring-1 ring-emerald-100'
                      : 'border-green-100 shadow-sm hover:border-green-200'
                  }`}
                >
                  {isMl ? (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-[#2d5f2e] to-emerald-500" />
                  ) : null}

                  <div className="flex items-center gap-3 p-4 sm:gap-5 sm:p-6">
                    <div className="relative shrink-0">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.accent} text-white shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16`}
                      >
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#1a2e1a] text-[10px] font-bold text-white sm:h-6 sm:w-6">
                        {index + 1}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-[#1a2e1a] sm:text-xl">
                          {meta.label}
                        </h2>
                        {isMl ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                            <Sparkles className="h-3 w-3" />
                            ML Model
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                            Symptom Form
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600">{meta.description}</p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2d5f2e] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        Start diagnosis
                        <ArrowRight className="h-4 w-4" />
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#2d5f2e] transition-all duration-300 group-hover:bg-[#2d5f2e] group-hover:text-white sm:h-11 sm:w-11">
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-xs text-gray-500"
      >
        Diagnosis results are reviewed by agriculture officers when confidence is below the
        verification threshold.
      </motion.p>
    </div>
  )
}
