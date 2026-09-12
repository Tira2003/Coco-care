import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Loader2,
  TreePine,
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
  EMPTY_STEM_QUESTIONNAIRE,
  STEM_STEPS,
  isStemQuestionnaireReady,
  questionnaireToSymptomsPayload,
  type StemQuestionnaireState,
} from '@/app/diagnosis/stemSymptomQuestionnaire'
import {
  Choice,
  QuizChoiceGrid,
  QuizQuestion,
  YnRow,
} from '@/app/diagnosis/QuestionnaireChoices'
import { QuestionnaireStepPager } from '@/app/diagnosis/QuestionnaireStepPager'

export function StemDiseaseDiagnosis() {
  const [step, setStep] = useState(0)
  const [farmId, setFarmId] = useState('')
  const [form, setForm] = useState<StemQuestionnaireState>(EMPTY_STEM_QUESTIONNAIRE)
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

  const patch = <K extends keyof StemQuestionnaireState>(key: K, value: StemQuestionnaireState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async () => {
    setError('')
    if (!farmId) {
      setError('Select a farm first.')
      return
    }
    if (!isStemQuestionnaireReady(form)) {
      setError('Answer palm age, fluid, damage location, holes, and at least a few other specific signs.')
      return
    }
    setSubmitting(true)
    try {
      const res = await diagnosisApi.submit({
        farmId,
        category: 'stem',
        symptoms: questionnaireToSymptomsPayload(form),
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
    setForm(EMPTY_STEM_QUESTIONNAIRE)
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
          New stem assessment
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
        className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-800 via-orange-700 to-amber-600 px-6 py-7 text-white shadow-lg"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          <TreePine className="h-3.5 w-3.5" />
          Stem & trunk · CRI-aligned symptom match
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Coconut stem & trunk problem diagnosis
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

      <QuestionnaireStepPager steps={STEM_STEPS} current={step} onChange={setStep} />

      <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{STEM_STEPS[step].title}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{STEM_STEPS[step].hint}</p>
          </div>
        </div>

        {step === 0 && (
          <QuizQuestion label="Approximately how old is the palm?">
            <QuizChoiceGrid>
              {[
                ['lt3', 'Less than 3 years'],
                ['3to5', '3–5 years'],
                ['6to15', '6–15 years'],
                ['gt15', 'More than 15 years'],
                ['unsure', 'Not sure'],
              ].map(([id, label]) => (
                <Choice key={id} active={form.q1_age === id} onClick={() => patch('q1_age', id)}>
                  {label}
                </Choice>
              ))}
            </QuizChoiceGrid>
          </QuizQuestion>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <QuizQuestion label="Is liquid coming from the trunk?">
              <QuizChoiceGrid>
                {[
                  ['no', 'No liquid'],
                  ['clear', 'Clear / watery'],
                  ['yellowish', 'Yellowish'],
                  ['reddish', 'Reddish-brown / rust'],
                  ['dark', 'Dark brown / black'],
                  ['unsure', 'Not sure'],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.q2_liquid === id}
                    onClick={() => patch('q2_liquid', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <YnRow
              label="Does the liquid come through vertical / longitudinal cracks?"
              value={form.q3_longitudinal}
              onChange={(v) => patch('q3_longitudinal', v)}
            />
            <YnRow
              label="Are there dried dark or black patches where bleeding occurred?"
              value={form.q4_black_patches}
              onChange={(v) => patch('q4_black_patches', v)}
            />
            <QuizQuestion label="Tissue under damaged bark (select all that apply)">
              <QuizChoiceGrid>
                {(
                  [
                    ['q5_yellow', 'Yellow tissue'],
                    ['q5_brown', 'Brown tissue'],
                    ['q5_fibrous', 'Brown fibrous decay'],
                    ['q5_soft', 'Soft / rotten'],
                    ['q5_peeling', 'Bark peeling off'],
                  ] as const
                ).map(([key, label]) => (
                  <Choice
                    key={key}
                    variant="multi"
                    active={form[key]}
                    onClick={() => {
                      patch(key, !form[key])
                      patch('q5_answered', true)
                    }}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <QuizQuestion label="Where is damage concentrated?">
              <QuizChoiceGrid>
                {[
                  ['base', 'Palm base'],
                  ['lower', 'Lower trunk'],
                  ['middle', 'Middle trunk'],
                  ['upper', 'Upper trunk'],
                  ['crown', 'Bud / crown area'],
                  ['multiple', 'Multiple regions'],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.q6_location === id}
                    onClick={() => patch('q6_location', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <YnRow
              label="Hard shelf / bracket / mushroom-like growth at the palm base?"
              value={form.q7_bracket}
              onChange={(v) => patch('q7_bracket', v)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <QuizQuestion label="Can you see holes in the trunk or crown?">
              <QuizChoiceGrid cols={4}>
                {[
                  ['no', 'No'],
                  ['one', 'One hole'],
                  ['several', 'Several'],
                  ['unsure', 'Not sure'],
                ].map(([id, label]) => (
                  <Choice key={id} active={form.q8_holes === id} onClick={() => patch('q8_holes', id)}>
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            {(form.q8_holes === 'one' || form.q8_holes === 'several') && (
              <QuizQuestion label="Where are most holes located?">
                <QuizChoiceGrid cols={3}>
                  {[
                    ['trunk', 'Trunk'],
                    ['base', 'Base'],
                    ['crown', 'Crown / bud'],
                  ].map(([id, label]) => (
                    <Choice
                      key={id}
                      active={form.q9_hole_location === id}
                      onClick={() => patch('q9_hole_location', id)}
                    >
                      {label}
                    </Choice>
                  ))}
                </QuizChoiceGrid>
              </QuizQuestion>
            )}
            <YnRow
              label="Chewed fibres / frass coming from a hole?"
              value={form.q10_frass}
              onChange={(v) => patch('q10_frass', v)}
            />
            <YnRow
              label="Thick brown sticky / viscous fluid from a hole?"
              value={form.q11_viscous}
              onChange={(v) => patch('q11_viscous', v)}
            />
            <YnRow
              label="Feeding or crunching noises inside the trunk or crown?"
              value={form.q12_crunch}
              onChange={(v) => patch('q12_crunch', v)}
              safety="Only check from ground level or an easy access point. Do not climb a damaged palm."
            />
            <YnRow
              label="Fibrous cocoons around petiole bases or under bark?"
              value={form.q13_cocoon}
              onChange={(v) => patch('q13_cocoon', v)}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <YnRow
              label="V-shaped / geometric cuts on newly opened leaves?"
              value={form.q14_vcuts}
              onChange={(v) => patch('q14_vcuts', v)}
            />
            <YnRow
              label="Fresh fibrous material around a feeding hole near the bud?"
              value={form.q15_bud_frass}
              onChange={(v) => patch('q15_bud_frass', v)}
            />
            <YnRow
              label="Youngest leaves crooked, malformed, or damaged?"
              value={form.q16_malformed}
              onChange={(v) => patch('q16_malformed', v)}
            />
            <YnRow
              label="Central / flag leaf broken or seriously damaged?"
              value={form.q17_flag_leaf}
              onChange={(v) => patch('q17_flag_leaf', v)}
            />
            <YnRow
              label="Visible black / rhinoceros beetle?"
              value={form.q_visible_beetle}
              onChange={(v) => patch('q_visible_beetle', v)}
            />
            <YnRow
              label="Mud / soil / earth tunnels running along the trunk?"
              value={form.q18_mud}
              onChange={(v) => patch('q18_mud', v)}
            />
            <YnRow
              label="Termites visible on trunk, under bark, or around the base?"
              value={form.q19_termites}
              onChange={(v) => patch('q19_termites', v)}
            />
            <YnRow
              label="Bark being eaten or peeling with damaged tissue beneath?"
              value={form.q20_bark_eaten}
              onChange={(v) => patch('q20_bark_eaten', v)}
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <QuizQuestion label="Are leaves yellowing?">
              <QuizChoiceGrid cols={4}>
                {[
                  ['none', 'None'],
                  ['few', 'Few'],
                  ['many', 'Many'],
                  ['severe', 'Severe'],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.q21_yellowing === id}
                    onClick={() => patch('q21_yellowing', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <YnRow
              label="Is the bud / crown weak, withered, tilted, or collapsing?"
              value={form.q22_crown_weak}
              onChange={(v) => patch('q22_crown_weak', v)}
            />
            <QuizQuestion label="Has the trunk recently been injured?">
              <QuizChoiceGrid>
                {[
                  ['none', 'None'],
                  ['knife', 'Knife / tool cut'],
                  ['machinery', 'Machinery injury'],
                  ['animal', 'Animal damage'],
                  ['cracked', 'Naturally cracked'],
                  ['other', 'Other wound'],
                  ['unsure', 'Not sure'],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.q23_injury === id}
                    onClick={() => patch('q23_injury', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <YnRow
              label="Recently affected by fire?"
              value={form.q24_fire}
              onChange={(v) => patch('q24_fire', v)}
            />
            <YnRow
              label="Lightning strike on this or nearby palms recently?"
              value={form.q25_lightning}
              onChange={(v) => patch('q25_lightning', v)}
            />
            <QuizQuestion label="Serious flooding / waterlogging recently?">
              <QuizChoiceGrid cols={4}>
                {[
                  ['none', 'None'],
                  ['occasional', 'Occasional'],
                  ['frequent', 'Frequent'],
                  ['severe', 'Severe'],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    active={form.q26_flooding === id}
                    onClick={() => patch('q26_flooding', id)}
                  >
                    {label}
                  </Choice>
                ))}
              </QuizChoiceGrid>
            </QuizQuestion>
            <YnRow
              label="Unusually high fertiliser amount applied recently?"
              value={form.q27_fertiliser}
              onChange={(v) => patch('q27_fertiliser', v)}
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
          {step < STEM_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEM_STEPS.length - 1, s + 1))}
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
