import { ArrowLeft, ClipboardList, Loader2, Sprout } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { farmApi, diagnosisApi } from '@/api/services'
import type { DiagnosisResult } from '@/types'
import {
  CATEGORY_DISEASES,
  CATEGORY_META,
  isDiagnosisCategory,
  type DiagnosisCategory,
} from '@/app/diagnosis/categories'
import { FarmSelector } from '@/app/diagnosis/FarmSelector'
import { DiagnosisResultPanel } from '@/app/diagnosis/DiagnosisResultPanel'
import { Choice, QuizChoiceGrid, QuizQuestion } from '@/app/diagnosis/QuestionnaireChoices'

export function SymptomDiseaseDiagnosis() {
  const { category: categoryParam } = useParams()
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState('')

  const category =
    categoryParam && isDiagnosisCategory(categoryParam) && categoryParam !== 'leaves'
      ? (categoryParam as Exclude<DiagnosisCategory, 'leaves'>)
      : null

  if (categoryParam === 'stem') {
    return <Navigate to="/app/disease-detection/stem" replace />
  }
  if (categoryParam === 'bud') {
    return <Navigate to="/app/disease-detection/bud" replace />
  }
  if (categoryParam === 'fruit') {
    return <Navigate to="/app/disease-detection/fruit" replace />
  }
  if (categoryParam === 'whole-tree') {
    return <Navigate to="/app/disease-detection" replace />
  }

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

  const farms = profile?.farms ?? []

  useEffect(() => {
    if (farms.length === 0) {
      setSelectedFarmId('')
      return
    }
    if (!selectedFarmId || !farms.some((f) => f.id === selectedFarmId)) {
      setSelectedFarmId(farms[0].id)
    }
  }, [farms, selectedFarmId])

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    )
    setResult(null)
    setError('')
  }

  const handleSubmit = async () => {
    if (!category) return
    if (!selectedFarmId) {
      setError('Select a farm before submitting.')
      return
    }
    if (selectedSymptoms.length === 0) {
      setError('Select at least one symptom to continue.')
      return
    }

    setScanning(true)
    setError('')
    try {
      const symptoms: Record<string, boolean> = {}
      selectedSymptoms.forEach((symptom) => {
        symptoms[symptom] = true
      })

      const diagnosis = await diagnosisApi.submit({
        farmId: selectedFarmId,
        category,
        symptoms,
      })
      setResult(diagnosis)
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message
      setError(message ?? 'Diagnosis failed. Ensure you are logged in and the backend is running.')
    } finally {
      setScanning(false)
    }
  }

  if (!category) {
    return <Navigate to="/app/disease-detection" replace />
  }

  const meta = CATEGORY_META[category]
  const diseases = CATEGORY_DISEASES[category]

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/app/disease-detection"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#2d5f2e] hover:text-[#1a2e1a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to categories
        </Link>
        <h1 className="mb-2 text-3xl text-[#1a2e1a]">{meta.label}</h1>
        <p className="text-[#6b7c6b]">
          Answer the symptom questionnaire below. This category is assessed using reported symptoms only.
        </p>
      </div>

      {farms.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <Sprout className="mx-auto mb-3 h-10 w-10 text-amber-600" />
          <h2 className="mb-2 text-lg font-semibold text-amber-900">No farms registered</h2>
          <p className="mb-4 text-sm text-amber-800">
            Add a farm to your profile before submitting a disease diagnosis.
          </p>
          <Link
            to="/app/profile"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2d5f2e] px-4 py-2 text-sm text-white hover:bg-[#1a2e1a]"
          >
            Go to Profile
          </Link>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {farms.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl text-[#1a2e1a]">
                {farms.length > 1 ? 'Select farm for this diagnosis' : 'Diagnosis farm'}
              </h2>
              <FarmSelector farms={farms} selectedFarmId={selectedFarmId} onSelect={setSelectedFarmId} />
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#2d5f2e]" />
                <h2 className="text-xl text-[#1a2e1a]">Symptom Questionnaire</h2>
              </div>
              <div className="space-y-4">
                {diseases.map((disease) => (
                  <QuizQuestion key={disease.name} label={disease.name} hint="Select all that you observe">
                    <QuizChoiceGrid>
                      {disease.symptoms.map((symptom) => (
                        <Choice
                          key={symptom}
                          variant="multi"
                          active={selectedSymptoms.includes(symptom)}
                          onClick={() => toggleSymptom(symptom)}
                        >
                          {symptom}
                        </Choice>
                      ))}
                    </QuizChoiceGrid>
                  </QuizQuestion>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFarmId || selectedSymptoms.length === 0 || scanning}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2d5f2e] py-4 text-white transition-colors hover:bg-[#1a2e1a] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing symptoms…
                </>
              ) : (
                'Submit Symptom Diagnosis'
              )}
            </button>
          </div>

          <div>
            {scanning ? (
              <div className="rounded-2xl border border-green-100 bg-white py-12 text-center shadow-sm">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#2d5f2e]" />
                <h3 className="mb-2 text-xl text-gray-900">Evaluating Symptoms</h3>
                <p className="text-gray-600">Matching your answers to known disease patterns…</p>
              </div>
            ) : null}

            {result && !scanning ? (
              <DiagnosisResultPanel result={result} methodLabel="Symptom questionnaire" />
            ) : null}

            {!scanning && !result ? (
              <div className="rounded-2xl border border-green-100 bg-white py-12 text-center shadow-sm">
                <ClipboardList className="mx-auto mb-4 h-10 w-10 text-green-600" />
                <h3 className="mb-2 text-xl text-gray-900">Ready for Symptom Diagnosis</h3>
                <p className="text-gray-600">
                  Select a farm, choose the symptoms you observe, and submit the questionnaire.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
