import {
  Apple,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { farmApi, diagnosisApi } from '@/api/services'
import type { DiagnosisResult } from '@/types'
import { FarmSelector } from '@/app/diagnosis/FarmSelector'
import { StemDiagnosisResultPanel } from '@/app/diagnosis/StemDiagnosisResultPanel'
import {
  EMPTY_FRUIT_QUESTIONNAIRE,
  FRUIT_STEPS,
  fruitQuestionnaireToSymptomsPayload,
  isFruitQuestionnaireReady,
  type FruitQuestionnaireState,
} from '@/app/diagnosis/fruitSymptomQuestionnaire'
import {
  Choice,
  QuizChoiceGrid,
  QuizQuestion,
  YnRow,
} from '@/app/diagnosis/QuestionnaireChoices'
import { QuestionnaireStepPager } from '@/app/diagnosis/QuestionnaireStepPager'

export function FruitDiseaseDiagnosis() {
  const [step, setStep] = useState(0)
  const [farmId, setFarmId] = useState('')
  const [form, setForm] = useState<FruitQuestionnaireState>(EMPTY_FRUIT_QUESTIONNAIRE)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState('')

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })
  const farms = profile?.farms ?? []

  useEffect(() => {
    if (farms.length > 0) setFarmId(farms[0].id)
  }, [farms])

  const patch = <K extends keyof FruitQuestionnaireState>(
    key: K,
    value: FruitQuestionnaireState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async () => {
    setError('')
    if (!farmId) {
      setError('Select a farm first.')
      return
    }
    if (!isFruitQuestionnaireReady(form)) {
      setError('Answer nut age, damage origin, and at least a few other specific signs.')
      return
    }
    setSubmitting(true)
    try {
      const res = await diagnosisApi.submit({
        farmId,
        category: 'fruit',
        symptoms: fruitQuestionnaireToSymptomsPayload(form),
      })
      setResult(res)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof (err.response.data as { message: unknown }).message === 'string'
          ? (err.response.data as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Diagnosis failed. Try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setResult(null)
    setForm(EMPTY_FRUIT_QUESTIONNAIRE)
    setStep(0)
    setError('')
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl pb-12">
        <button
          type="button"
          onClick={reset}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#2d5f2e] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          New fruit / nut assessment
        </button>
        <StemDiagnosisResultPanel result={result} />
        <div className="mt-6">
          <Link
            to="/app/disease-detection"
            className="text-sm font-medium text-gray-600 hover:text-[#2d5f2e]"
          >
            ← Back to diagnosis areas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <Link
        to="/app/disease-detection"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#2d5f2e]"
      >
        <ArrowLeft className="h-4 w-4" />
        Diagnosis areas
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white p-5 sm:p-6"
      >
        <div className="mb-2 flex items-center gap-2 text-amber-800">
          <Apple className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wide">Coconut fruit / nut</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Coconut fruit &amp; nut problem diagnosis
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Answer what you observe on young nuts and nearby leaves. Results are symptom match scores
          (not lab probability), aligned with CRI-described patterns for mite, scale, rats, and nut
          fall.
        </p>
      </motion.div>

      <div className="mb-6 space-y-2">
        <label className="text-sm font-medium text-gray-800">Farm</label>
        {profileLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading farms…
          </div>
        ) : (
          <FarmSelector farms={farms} value={farmId} onChange={setFarmId} />
        )}
      </div>

      <QuestionnaireStepPager steps={FRUIT_STEPS} current={step} onChange={setStep} />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-2">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-[#2d5f2e]" />
          <div>
            <h2 className="font-semibold text-gray-900">{FRUIT_STEPS[step].title}</h2>
            <p className="text-xs text-gray-500">{FRUIT_STEPS[step].hint}</p>
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <QuizQuestion label="Approximately how old is the affected nut?">
              <QuizChoiceGrid>
                {(
                  [
                    ['button', 'Very young / button nut'],
                    ['1to2', '1–2 months'],
                    ['3to6', '3–6 months'],
                    ['7to8', '7–8 months'],
                    ['mature', 'Mature'],
                    ['unsure', 'Not sure'],
                  ] as const
                ).map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.fr_q1_age === id}
                    onClick={() => patch('fr_q1_age', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <QuizQuestion label="Where does the visible damage begin?">
              <QuizChoiceGrid>
                {(
                  [
                    ['below_perianth', 'Immediately below floral cap / perianth'],
                    ['middle', 'Middle of nut'],
                    ['bottom', 'Bottom of nut'],
                    ['entire', 'Entire surface'],
                    ['random', 'Random damaged point'],
                    ['unsure', 'Not sure'],
                  ] as const
                ).map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.fr_q2_origin === id}
                    onClick={() => patch('fr_q2_origin', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <YnRow
              label="Pale yellow / cream / white triangular patch beginning below the perianth?"
              value={form.fr_q3_triangle}
              onChange={(v) => patch('fr_q3_triangle', v)}
            />
            <YnRow
              label="Has that patch become brown, dry, corky or necrotic?"
              value={form.fr_q4_corky}
              onChange={(v) => patch('fr_q4_corky', v)}
            />
            <YnRow
              label="Does the damaged patch expand downward from the perianth?"
              value={form.fr_q5_downward}
              onChange={(v) => patch('fr_q5_downward', v)}
            />
            <YnRow
              label="Is the affected nut noticeably smaller than others of the same age?"
              value={form.fr_q6_small}
              onChange={(v) => patch('fr_q6_small', v)}
            />
            <YnRow
              label="Is the nut deformed or irregular in shape?"
              value={form.fr_q7_deformed}
              onChange={(v) => patch('fr_q7_deformed', v)}
            />
            <YnRow
              label="Deep cracks or fissures in the nut surface?"
              value={form.fr_q8_cracks}
              onChange={(v) => patch('fr_q8_cracks', v)}
            />
            <YnRow
              label="Do cracks form a Y-shaped pattern near the perianth?"
              value={form.fr_q9_y_crack}
              onChange={(v) => patch('fr_q9_y_crack', v)}
            />
            <YnRow
              label="Sticky or gummy material coming from cracks?"
              value={form.fr_q10_gummy}
              onChange={(v) => patch('fr_q10_gummy', v)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <YnRow
              label="Many tiny scale-like spots attached to the nut surface?"
              value={form.fr_q11_scale}
              onChange={(v) => patch('fr_q11_scale', v)}
            />
            <YnRow
              label="Yellowish-white crust / encrustation containing tiny insects?"
              value={form.fr_q12_encrust}
              onChange={(v) => patch('fr_q12_encrust', v)}
            />
            <YnRow
              label="Nearby leaves also have many yellow spots or scale insects underneath?"
              value={form.fr_q13_leaf_scale}
              onChange={(v) => patch('fr_q13_leaf_scale', v)}
            />
            <YnRow
              label="Clear bite or gnaw marks on the nut?"
              value={form.fr_q14_gnaw}
              onChange={(v) => patch('fr_q14_gnaw', v)}
            />
            <YnRow
              label="Has an animal made a hole through the husk into the nut?"
              value={form.fr_q15_hole}
              onChange={(v) => patch('fr_q15_hole', v)}
            />
            <YnRow
              label="Part of the kernel eaten, or nut water missing?"
              value={form.fr_q16_kernel}
              onChange={(v) => patch('fr_q16_kernel', v)}
            />
            <YnRow
              label="Rats, nests, or frequent rodent activity seen around these palms?"
              value={form.fr_q17_rodents}
              onChange={(v) => patch('fr_q17_rodents', v)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <YnRow
              label="Is nut damage mainly shallow / superficial scraping of the outer skin?"
              value={form.fr_q18_scrape}
              onChange={(v) => patch('fr_q18_scrape', v)}
            />
            <YnRow
              label="Are many lower leaves also brown and dried?"
              value={form.fr_q19_brown_leaves}
              onChange={(v) => patch('fr_q19_brown_leaves', v)}
            />
            <YnRow
              label="Caterpillar galleries / webbing on the lower surface of damaged leaves?"
              value={form.fr_q20_galleries}
              onChange={(v) => patch('fr_q20_galleries', v)}
            />
            <QuizQuestion label="Are immature nuts falling before maturity?">
              <QuizChoiceGrid>
                {(
                  [
                    ['no', 'No'],
                    ['few', 'A few'],
                    ['many', 'Many'],
                    ['severe', 'Severe'],
                    ['unsure', 'Not sure'],
                  ] as const
                ).map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.fr_q21_fall === id}
                    onClick={() => patch('fr_q21_fall', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <YnRow
              label="Do fallen nuts show characteristic mite scars?"
              value={form.fr_q22_fallen_mite}
              onChange={(v) => patch('fr_q22_fallen_mite', v)}
            />
            <YnRow
              label="Do fallen nuts show bite / gnaw damage?"
              value={form.fr_q23_fallen_gnaw}
              onChange={(v) => patch('fr_q23_fallen_gnaw', v)}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <YnRow
              label="Has there been a prolonged dry period?"
              value={form.fr_q24_dry}
              onChange={(v) => patch('fr_q24_dry', v)}
            />
            <YnRow
              label="Has the palm recently experienced serious drought or water stress?"
              value={form.fr_q25_drought}
              onChange={(v) => patch('fr_q25_drought', v)}
            />
            <YnRow
              label="Fruit recently damaged by tools, harvesting, falling branches, or strong wind?"
              value={form.fr_q26_mechanical}
              onChange={(v) => patch('fr_q26_mechanical', v)}
            />
          </div>
        )}

        {error && (
          <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {step < FRUIT_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(FRUIT_STEPS.length - 1, s + 1))}
              className="inline-flex items-center gap-1 rounded-xl bg-[#2d5f2e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#244f25]"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !farmId}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Matching symptoms…
                </>
              ) : (
                <>
                  Get diagnosis
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
