import {
  ArrowLeft,
  Camera,
  ImageIcon,
  Leaf,
  Loader2,
  Sparkles,
  Upload,
  AlertCircle,
  ClipboardList,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { farmApi, diagnosisApi } from '@/api/services'
import type { DiagnosisResult } from '@/types'
import { LeafPredictionPanel } from '@/app/diagnosis/LeafPredictionPanel'
import { LeafDiseaseDetailCard } from '@/app/diagnosis/LeafDiseaseDetailCard'
import { LEAF_PANEL_BASE } from '@/app/diagnosis/panelLayout'
import { compressImageForUpload } from '@/utils/compressImage'
import {
  EMPTY_LEAF_QUESTIONNAIRE,
  LEAF_AREA_OPTIONS,
  LEAF_CONFIDENCE_REFINE_THRESHOLD,
  LEAF_SYMPTOM_GROUPS,
  getMatchLevelLabel,
  isQuestionnaireReady,
  questionnaireToSymptomsPayload,
  type LeafQuestionnaireState,
} from '@/app/diagnosis/leafSymptomQuestionnaire'
import {
  Choice,
  QuizChoiceGrid,
  QuizQuestion,
} from '@/app/diagnosis/QuestionnaireChoices'

export function LeafDiseaseDiagnosis() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [farmId, setFarmId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState('')
  const [questionnaire, setQuestionnaire] = useState<LeafQuestionnaireState>(EMPTY_LEAF_QUESTIONNAIRE)
  const [refining, setRefining] = useState(false)

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

  const farms = profile?.farms ?? []

  useEffect(() => {
    if (farms.length > 0) {
      setFarmId(farms[0].id)
    }
  }, [farms])

  const resetForm = () => {
    setQuestionnaire(EMPTY_LEAF_QUESTIONNAIRE)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setError('')
      const compressed = await compressImageForUpload(file)
      setUploadedImage(compressed)
      setResult(null)
      resetForm()
    } catch {
      setError('Could not process that image. Try a different photo.')
    }

    e.target.value = ''
  }

  const handleScan = async () => {
    if (!farmId) {
      setError('Add a farm in your profile before running diagnosis.')
      return
    }
    if (!uploadedImage) {
      setError('Upload a coconut leaf image to run classification.')
      return
    }

    setScanning(true)
    setError('')
    resetForm()
    try {
      const diagnosis = await diagnosisApi.submit({
        farmId,
        category: 'leaves',
        imageUrl: uploadedImage,
        symptoms: {},
      })
      setResult(diagnosis)
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message
      setError(message ?? 'Classification failed. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  const toggleSymptom = (id: string) => {
    setQuestionnaire((prev) => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(id)
        ? prev.selectedSymptoms.filter((s) => s !== id)
        : [...prev.selectedSymptoms, id],
    }))
  }

  const handleRefineDiagnosis = async () => {
    if (!farmId) {
      setError('Add a farm in your profile before refining diagnosis.')
      return
    }
    if (!uploadedImage) {
      setError('Upload a coconut leaf image before refining diagnosis.')
      return
    }
    if (!isQuestionnaireReady(questionnaire)) {
      setError('Select leaf area and at least 2 visible symptoms to refine diagnosis.')
      return
    }

    setRefining(true)
    setError('')
    try {
      const symptoms = questionnaireToSymptomsPayload(questionnaire)
      const diagnosis = await diagnosisApi.submit({
        farmId,
        category: 'leaves',
        imageUrl: uploadedImage,
        symptoms,
      })
      setResult(diagnosis)
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message
      setError(message ?? 'Refinement failed. Please try again.')
    } finally {
      setRefining(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  if (farms.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-amber-900">No farm registered</h2>
        <p className="mb-4 text-sm text-amber-800">
          Add a farm in your profile to save diagnosis reports.
        </p>
        <Link
          to="/app/profile"
          className="inline-flex rounded-lg bg-[#2d5f2e] px-4 py-2 text-sm text-white hover:bg-[#1a2e1a]"
        >
          Go to Profile
        </Link>
      </div>
    )
  }

  const showQuestionnaire =
    result && !scanning && result.confidence < LEAF_CONFIDENCE_REFINE_THRESHOLD
  const showDetailCard =
    result &&
    !scanning &&
    result.predictions?.length &&
    result.confidence >= LEAF_CONFIDENCE_REFINE_THRESHOLD
  const showOfficerCard =
    result &&
    !scanning &&
    result.confidence < LEAF_CONFIDENCE_REFINE_THRESHOLD &&
    (result.matchLevel === 'moderate' ||
      result.matchLevel === 'uncertain' ||
      Boolean(result.officerAlert) ||
      Boolean(result.symptomResult && result.symptomResult !== 'ML classification only'))

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          to="/app/disease-detection"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-1.5 text-sm font-medium text-[#2d5f2e] shadow-sm transition-colors hover:border-green-200 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to categories
        </Link>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a2e1a] to-[#2d5f2e] px-6 py-5 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-200">
                ML leaf diagnosis
              </p>
              <h1 className="text-2xl font-bold sm:text-3xl">Coconut Leaves & Leaflets</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-green-100">
                Upload a clear photo of affected leaves. Our machine learning model classifies
                the disease from the image.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={LEAF_PANEL_BASE}
        >
          <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#1a2e1a]">Upload Leaf Image</h2>
              <p className="mt-0.5 text-sm text-gray-500">JPG or PNG · clear close-up photo</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#2d5f2e]">
              <ImageIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="mb-4 min-h-0 flex-1 overflow-hidden rounded-xl border-2 border-dashed border-green-200/80 bg-gradient-to-b from-green-50/50 to-white transition-colors hover:border-green-300">
            {uploadedImage ? (
              <div className="group relative h-full min-h-[280px]">
                <img
                  src={uploadedImage}
                  alt="Uploaded coconut leaf"
                  className="h-full w-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage(null)
                    setResult(null)
                    resetForm()
                  }}
                  className="absolute right-3 top-3 rounded-lg bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur-sm hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-[#2d5f2e]">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mb-1 text-sm font-medium text-gray-800">Drop or select a leaf photo</p>
                <p className="mb-5 text-xs text-gray-500">Affected coconut leaves work best</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#2d5f2e] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1a2e1a] hover:shadow-md">
                    <Upload className="h-4 w-4" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-[#2d5f2e]/30 bg-white px-5 py-2.5 text-sm font-medium text-[#2d5f2e] transition-all hover:border-[#2d5f2e] hover:bg-green-50">
                    <Camera className="h-4 w-4" />
                    Camera
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleScan}
            disabled={!uploadedImage || scanning}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2d5f2e] to-[#1a2e1a] py-4 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none"
          >
            {scanning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Classifying…
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
                Classify with ML Model
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <LeafPredictionPanel result={result} scanning={scanning} />
        </motion.div>
      </div>

      {showQuestionnaire ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-700">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">
                COCO CARE – Coconut Leaf Symptom Questionnaire
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                Answer the questions below about what you see on the leaf. Your answers help refine
                the diagnosis when the image result needs more support.
              </p>
              <p className="mt-2 text-xs text-amber-700/90">
                Results are guidance only and should be verified by an agriculture officer before
                treatment decisions.
              </p>
            </div>
          </div>

          {/* Step 1 */}
          <section className="mb-6">
            <QuizQuestion
              label="Step 1 — Select the affected leaf area"
              hint="Allow one selection."
            >
              <QuizChoiceGrid>
                {LEAF_AREA_OPTIONS.map((option) => {
                  const active = questionnaire.leafArea === option.id
                  return (
                    <Choice
                      key={option.id}
                      active={active}
                      onClick={() =>
                        setQuestionnaire((prev) => ({ ...prev, leafArea: option.id }))
                      }
                    >
                      {option.label}
                    </Choice>
                  )
                })}
              </QuizChoiceGrid>
            </QuizQuestion>
          </section>

          {/* Step 2 */}
          <section className="mb-6">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#1a2e1a]">
              Step 2 — Select all visible symptoms
            </h4>
            <div className="space-y-4">
              {LEAF_SYMPTOM_GROUPS.map((group) => (
                <QuizQuestion key={group.title} label={group.title} hint={group.note}>
                  <QuizChoiceGrid>
                    {group.symptoms.map((symptom) => {
                      const selected = questionnaire.selectedSymptoms.includes(symptom.id)
                      return (
                        <Choice
                          key={symptom.id}
                          variant="multi"
                          active={selected}
                          onClick={() => toggleSymptom(symptom.id)}
                        >
                          {symptom.label}
                        </Choice>
                      )
                    })}
                  </QuizChoiceGrid>
                </QuizQuestion>
              ))}
            </div>
          </section>

          {/* Step 3 */}
          <section className="mb-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#1a2e1a]">
              Step 3 — Additional questions
            </h4>
            <p className="mb-3 text-xs text-gray-600">
              These questions help distinguish similar conditions.
            </p>
            <div className="space-y-4">
              <QuizQuestion label="Can you see separate spots with defined borders?">
                <QuizChoiceGrid cols={2}>
                  <Choice
                    active={questionnaire.qSpotsBordered === 'yes'}
                    onClick={() =>
                      setQuestionnaire((p) => ({ ...p, qSpotsBordered: 'yes' }))
                    }
                    variant="compact"
                  >
                    Yes
                  </Choice>
                  <Choice
                    active={questionnaire.qSpotsBordered === 'no'}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qSpotsBordered: 'no' }))}
                    variant="compact"
                  >
                    No
                  </Choice>
                </QuizChoiceGrid>
              </QuizQuestion>

              <QuizQuestion label="Is the yellowing uneven rather than uniformly affecting an old leaf?">
                <QuizChoiceGrid cols={2}>
                  <Choice
                    active={questionnaire.qUnevenYellowing === 'yes'}
                    onClick={() =>
                      setQuestionnaire((p) => ({ ...p, qUnevenYellowing: 'yes' }))
                    }
                    variant="compact"
                  >
                    Yes
                  </Choice>
                  <Choice
                    active={questionnaire.qUnevenYellowing === 'no'}
                    onClick={() =>
                      setQuestionnaire((p) => ({ ...p, qUnevenYellowing: 'no' }))
                    }
                    variant="compact"
                  >
                    No
                  </Choice>
                </QuizChoiceGrid>
              </QuizQuestion>

              <QuizQuestion label="Are the leaflets visibly bent or hanging downward?">
                <QuizChoiceGrid cols={3}>
                  <Choice
                    active={questionnaire.qLeafletsBent === 'slightly'}
                    onClick={() =>
                      setQuestionnaire((p) => ({ ...p, qLeafletsBent: 'slightly' }))
                    }
                    variant="compact"
                  >
                    Slightly
                  </Choice>
                  <Choice
                    active={questionnaire.qLeafletsBent === 'severely'}
                    onClick={() =>
                      setQuestionnaire((p) => ({ ...p, qLeafletsBent: 'severely' }))
                    }
                    variant="compact"
                  >
                    Severely
                  </Choice>
                  <Choice
                    active={questionnaire.qLeafletsBent === 'no'}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qLeafletsBent: 'no' }))}
                    variant="compact"
                  >
                    No
                  </Choice>
                </QuizChoiceGrid>
              </QuizQuestion>

              <QuizQuestion label="Can you see silk, frass or caterpillars underneath?">
                <QuizChoiceGrid cols={2}>
                  <Choice
                    active={questionnaire.qSilkFrass === 'yes'}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qSilkFrass: 'yes' }))}
                    variant="compact"
                  >
                    Yes
                  </Choice>
                  <Choice
                    active={questionnaire.qSilkFrass === 'no'}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qSilkFrass: 'no' }))}
                    variant="compact"
                  >
                    No
                  </Choice>
                </QuizChoiceGrid>
              </QuizQuestion>

              <QuizQuestion label="Is the youngest spear leaf rotten or unable to open?">
                <QuizChoiceGrid cols={2}>
                  <Choice
                    active={questionnaire.qSpearRotten === 'yes'}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qSpearRotten: 'yes' }))}
                    variant="compact"
                  >
                    Yes
                  </Choice>
                  <Choice
                    active={questionnaire.qSpearRotten === 'no'}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qSpearRotten: 'no' }))}
                    variant="compact"
                  >
                    No
                  </Choice>
                </QuizChoiceGrid>
              </QuizQuestion>

              <QuizQuestion label="Are symptoms present on more than one palm nearby?">
                <QuizChoiceGrid cols={3}>
                  <Choice
                    active={questionnaire.qNearbyPalms === 'yes'}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qNearbyPalms: 'yes' }))}
                    variant="compact"
                  >
                    Yes
                  </Choice>
                  <Choice
                    active={questionnaire.qNearbyPalms === 'no'}
                    onClick={() => setQuestionnaire((p) => ({ ...p, qNearbyPalms: 'no' }))}
                    variant="compact"
                  >
                    No
                  </Choice>
                  <Choice
                    active={questionnaire.qNearbyPalms === 'unsure'}
                    onClick={() =>
                      setQuestionnaire((p) => ({ ...p, qNearbyPalms: 'unsure' }))
                    }
                    variant="compact"
                  >
                    Not sure
                  </Choice>
                </QuizChoiceGrid>
              </QuizQuestion>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefineDiagnosis}
              disabled={refining || !isQuestionnaireReady(questionnaire)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2d5f2e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a2e1a] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {refining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating diagnosis…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Apply answers
                </>
              )}
            </button>
            <p className="text-sm text-amber-900/80">
              Symptoms selected:{' '}
              <span className="font-semibold">{questionnaire.selectedSymptoms.length}</span>
            </p>
          </div>
          <p className="mt-3 text-xs text-amber-800">
            Never treat the result as a confirmed disease until an agriculture officer verifies it.
          </p>
        </motion.div>
      ) : null}

      {showOfficerCard ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" />
            <div>
              <h4 className="text-sm font-semibold text-orange-900">
                {getMatchLevelLabel(result?.matchLevel, result?.confidence ?? 0)}
              </h4>
              <p className="mt-1 text-sm text-orange-800">
                Most likely condition:{' '}
                <span className="font-semibold">{result?.finalResult}</span>. Please contact your
                agricultural officer for field verification
                {result?.officerAlert ? `. ${result.officerAlert}` : ''}.
              </p>
              {result?.secondaryConditions?.length ? (
                <p className="mt-2 text-sm text-orange-800">
                  Also consider: {result.secondaryConditions.join('; ')}.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showDetailCard ? (
        <LeafDiseaseDetailCard diseaseName={result!.finalResult} />
      ) : null}
    </div>
  )
}
