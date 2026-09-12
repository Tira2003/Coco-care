import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Loader2,
  Sprout,
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
  BUD_STEPS,
  EMPTY_BUD_QUESTIONNAIRE,
  budQuestionnaireToSymptomsPayload,
  isBudQuestionnaireReady,
  type BudQuestionnaireState,
} from '@/app/diagnosis/budSymptomQuestionnaire'
import {
  Choice,
  QuizChoiceGrid,
  QuizQuestion,
  YnRow,
} from '@/app/diagnosis/QuestionnaireChoices'
import { QuestionnaireStepPager } from '@/app/diagnosis/QuestionnaireStepPager'

export function BudDiseaseDiagnosis() {
  const [step, setStep] = useState(0)
  const [farmId, setFarmId] = useState('')
  const [form, setForm] = useState<BudQuestionnaireState>(EMPTY_BUD_QUESTIONNAIRE)
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

  const patch = <K extends keyof BudQuestionnaireState>(key: K, value: BudQuestionnaireState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async () => {
    setError('')
    if (!farmId) {
      setError('Select a farm first.')
      return
    }
    if (!isBudQuestionnaireReady(form)) {
      setError('Answer palm age, spear condition, holes, and at least a few other specific signs.')
      return
    }
    setSubmitting(true)
    try {
      const res = await diagnosisApi.submit({
        farmId,
        category: 'bud',
        symptoms: budQuestionnaireToSymptomsPayload(form),
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
    setForm(EMPTY_BUD_QUESTIONNAIRE)
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
          New bud & crown assessment
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
        All diagnosis areas
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-lime-800 via-green-700 to-emerald-600 px-6 py-7 text-white shadow-lg"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          <Sprout className="h-3.5 w-3.5" />
          Bud & crown · CRI-aligned symptom match
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Coconut bud & crown problem diagnosis
        </h1>
      </motion.div>

      {profileLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading farms…
        </div>
      ) : farms.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Add a farm in your profile before submitting a diagnosis.
        </div>
      ) : (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-gray-700">Farm</p>
          <FarmSelector farms={farms} selectedFarmId={farmId} onSelect={setFarmId} />
        </div>
      )}

      <QuestionnaireStepPager steps={BUD_STEPS} current={step} onChange={setStep} />

      <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-start gap-2">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-lime-700" />
          <div>
            <h2 className="font-semibold text-gray-900">{BUD_STEPS[step].title}</h2>
            <p className="text-xs text-gray-500">{BUD_STEPS[step].hint}</p>
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <QuizQuestion label="Approximately how old is the palm?">
              <QuizChoiceGrid>
                {[
                  ['lt3', 'Less than 3 years'],
                  ['3to5', '3–5 years'],
                  ['6to15', '6–15 years'],
                  ['gt15', 'More than 15 years'],
                  ['unsure', 'Not sure'],
                ].map(([id, label]) => (
                  <Choice key={id} active={form.bc_q1_age === id} onClick={() => patch('bc_q1_age', id)}>
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <QuizQuestion label="Does the central spear leaf look unhealthy?">
              <QuizChoiceGrid>
                {[
                  ['normal', 'Normal'],
                  ['dull', 'Slightly dull'],
                  ['yellow', 'Yellowing'],
                  ['wilting', 'Wilting'],
                  ['brown', 'Brown / dry'],
                  ['unsure', 'Not sure'],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.bc_q2_spear === id}
                    onClick={() => patch('bc_q2_spear', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <YnRow
              label="Can the spear leaf be pulled out unusually easily?"
              value={form.bc_q3_pullable}
              onChange={(v) => patch('bc_q3_pullable', v)}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <QuizQuestion label="Is the base of the spear leaf discoloured?">
              <QuizChoiceGrid>
                {[
                  ['no', 'No'],
                  ['yellow', 'Yellow'],
                  ['brown', 'Brown'],
                  ['dark', 'Dark brown / black'],
                  ['unsure', 'Not sure'],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.bc_q4_spear_base === id}
                    onClick={() => patch('bc_q4_spear_base', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <YnRow
              label="Is the tissue around the bud soft or rotten?"
              value={form.bc_q5_soft_rot}
              onChange={(v) => patch('bc_q5_soft_rot', v)}
            />
            <YnRow
              label="Is there a foul / unpleasant smell from the bud?"
              value={form.bc_q6_foul}
              onChange={(v) => patch('bc_q6_foul', v)}
            />
            <YnRow
              label="Has the central bud started breaking away or falling?"
              value={form.bc_q7_bud_fall}
              onChange={(v) => patch('bc_q7_bud_fall', v)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <QuizQuestion label="Are there visible holes in or around the crown?">
              <QuizChoiceGrid cols={4}>
                {[
                  ['none', 'None'],
                  ['one', 'One'],
                  ['several', 'Several'],
                  ['unsure', 'Not sure'],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.bc_q8_holes === id}
                    onClick={() => patch('bc_q8_holes', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            {(form.bc_q8_holes === 'one' || form.bc_q8_holes === 'several') && (
              <QuizQuestion label="Where is the hole mainly located?">
                <QuizChoiceGrid>
                  {[
                    ['bud_base', 'Base of bud'],
                    ['inside_crown', 'Inside crown'],
                    ['petiole', 'Petiole base'],
                    ['multiple', 'Multiple crown locations'],
                  ].map(([id, label]) => (
                    <Choice
                      key={id}
                      active={form.bc_q9_hole_loc === id}
                      onClick={() => patch('bc_q9_hole_loc', id)}
                    >
                      {label}
                    </Choice>
                  ))}
                </QuizChoiceGrid>
              </QuizQuestion>
            )}
            <YnRow
              label="Fresh chewed fibre / frass coming from the hole?"
              value={form.bc_q10_frass}
              onChange={(v) => patch('bc_q10_frass', v)}
            />
            <YnRow
              label="Thick brown / sticky fluid oozing from a crown hole?"
              value={form.bc_q11_viscous}
              onChange={(v) => patch('bc_q11_viscous', v)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <YnRow
              label="Chewing / crunching sounds inside the crown or trunk?"
              value={form.bc_q12_crunch}
              onChange={(v) => patch('bc_q12_crunch', v)}
              safety="Do not climb or stand beneath a structurally weakened palm to check this."
            />
            <YnRow
              label="Fibrous cocoons at the bases of leaf stalks / petioles?"
              value={form.bc_q13_cocoon}
              onChange={(v) => patch('bc_q13_cocoon', v)}
            />
            <YnRow
              label="Newly opened leaves showing V-shaped or geometric cuts?"
              value={form.bc_q14_vcuts}
              onChange={(v) => patch('bc_q14_vcuts', v)}
            />
            <YnRow
              label="Fresh frass around an entry hole at the base of the bud?"
              value={form.bc_q15_bud_frass}
              onChange={(v) => patch('bc_q15_bud_frass', v)}
            />
            <YnRow
              label="New leaves crooked or malformed?"
              value={form.bc_q16_crooked}
              onChange={(v) => patch('bc_q16_crooked', v)}
            />
            <YnRow
              label="Is the flag / young central leaf broken?"
              value={form.bc_q17_flag}
              onChange={(v) => patch('bc_q17_flag', v)}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <YnRow
              label="Brown patches mainly on very young / unopened crown leaves?"
              value={form.bc_q18_brown_patches}
              onChange={(v) => patch('bc_q18_brown_patches', v)}
            />
            <YnRow
              label="Does the damage look superficial rather than a deep hole?"
              value={form.bc_q19_superficial}
              onChange={(v) => patch('bc_q19_superficial', v)}
            />
            <YnRow
              label="Small beetles/larvae on damaged young bud leaves?"
              value={form.bc_q20_insects}
              onChange={(v) => patch('bc_q20_insects', v)}
            />
            <YnRow
              label="Is the bud tilting / slanting?"
              value={form.bc_q21_tilt}
              onChange={(v) => patch('bc_q21_tilt', v)}
            />
            <QuizQuestion label="Are nearby crown fronds wilting?">
              <QuizChoiceGrid cols={4}>
                {[
                  ['none', 'None'],
                  ['few', 'One / few'],
                  ['several', 'Several'],
                  ['most', 'Most of crown'],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.bc_q22_fronds === id}
                    onClick={() => patch('bc_q22_fronds', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <YnRow
              label="Lower / older leaves still healthy green while crown is dying?"
              value={form.bc_q23_lower_green}
              onChange={(v) => patch('bc_q23_lower_green', v)}
            />
            <YnRow
              label="Immature nuts falling unusually?"
              value={form.bc_q24_nut_fall}
              onChange={(v) => patch('bc_q24_nut_fall', v)}
            />
            <YnRow
              label="Inflorescences / flower structures drying?"
              value={form.bc_q25_infloresc}
              onChange={(v) => patch('bc_q25_infloresc', v)}
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <YnRow
              label="Prolonged wet / high-humidity weather recently?"
              value={form.bc_q26_humidity}
              onChange={(v) => patch('bc_q26_humidity', v)}
            />
            <YnRow
              label="Palm in a frequently flooded / waterlogged area?"
              value={form.bc_q27_flood}
              onChange={(v) => patch('bc_q27_flood', v)}
            />
            <YnRow
              label="Young palm heavily shaded by older palms?"
              value={form.bc_q28_shade}
              onChange={(v) => patch('bc_q28_shade', v)}
            />
            <YnRow
              label="Recent fresh wound (pruning, animal, tool, beetle injury)?"
              value={form.bc_q29_wound}
              onChange={(v) => patch('bc_q29_wound', v)}
            />
            <YnRow
              label="Crown recently broken by wind, objects, pruning, or physical force?"
              value={form.bc_q30_physical}
              onChange={(v) => patch('bc_q30_physical', v)}
            />
            <YnRow
              label="Is damage mainly on leaflet surfaces of older open fronds (not spear / bud / crown)?"
              value={form.bc_leaflet_surface}
              onChange={(v) => patch('bc_leaflet_surface', v)}
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
          {step < BUD_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(BUD_STEPS.length - 1, s + 1))}
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
              className="inline-flex items-center gap-2 rounded-xl bg-lime-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-lime-800 disabled:opacity-50"
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
