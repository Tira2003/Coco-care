import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import type { DiagnosisResult } from '@/types'
import { formatPercentage } from '@/app/diagnosis/formatPercentage'

export function DiagnosisResultPanel({
  result,
  methodLabel,
}: {
  result: DiagnosisResult
  methodLabel: string
}) {
  const adviceLines = result.advice
    ? result.advice.split(/[.!]\s+/).filter(Boolean)
    : []

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] p-6 text-white shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <AlertCircle className="mt-1 h-6 w-6 shrink-0" />
          <div>
            <h2 className="mb-2 text-2xl">Detection Result</h2>
            <p className="text-sm capitalize text-green-100">Status: {result.status}</p>
          </div>
        </div>
        <div className="rounded-xl bg-white/10 p-4">
          <div className="mb-1 text-sm text-green-100">Detected Disease</div>
          <div className="mb-3 text-2xl">{result.finalResult}</div>
          <div className="text-xl">{formatPercentage(result.confidence)}% confidence</div>
        </div>
      </div>

      <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="text-lg text-gray-900">Recommended Actions</h3>
        </div>
        <ul className="space-y-2">
          {adviceLines.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="mt-1 text-green-600">•</span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg text-gray-900">Analysis Details</h3>
        </div>
        <p className="text-sm text-gray-700">Method: {methodLabel}</p>
        <p className="mt-1 text-sm text-gray-700">Image: {result.imageResult}</p>
        <p className="mt-1 text-sm text-gray-700">Symptoms: {result.symptomResult}</p>
      </div>
    </div>
  )
}
