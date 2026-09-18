import { Link } from 'react-router'
import { Leaf, Camera, ChevronRight } from 'lucide-react'
import type { DiseaseReport } from '@/types'
import { getDiseaseEmoji, getStatusBadge, getMethodBadge, formatDate } from './dashboardUtils'

interface MobileRecentDetectionsProps {
  reports: DiseaseReport[]
}

export function MobileRecentDetections({ reports }: MobileRecentDetectionsProps) {
  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-extrabold text-[#123524]">Recent detections</h2>
        <Link to="/app/disease-detection" className="text-xs font-bold text-[#2D5B25] hover:underline">
          See all
        </Link>
      </div>

      <div className="rounded-[24px] border border-[#E8ECE2] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] divide-y divide-[#F1F4EC]">
        {reports.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mx-auto w-10 h-10 rounded-[13px] bg-[#EAF5DF] text-[#2D5B25] flex items-center justify-center mb-2">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="text-[13.5px] font-bold text-[#123524]">No diagnosis reports yet</div>
            <p className="text-[11px] text-[#8A9A8E] mt-0.5 max-w-xs mx-auto">
              Take a photo of a leaf or enter symptoms to diagnose palm diseases.
            </p>
            <Link
              to="/app/disease-detection"
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#123524] text-[#C9F169] text-[11px] font-bold"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Start diagnosis</span>
            </Link>
          </div>
        ) : (
          reports.slice(0, 3).map((r) => {
            const disease = r.finalResult ?? r.imageResult ?? r.symptomResult ?? 'Healthy Palm'
            const { emoji, bg } = getDiseaseEmoji(disease)
            const badge = getStatusBadge(r.status, r.confidence)
            const method = getMethodBadge(r)
            return (
              <Link
                key={r.id}
                to="/app/disease-detection"
                className="flex items-center gap-3 p-3.5 active:bg-[#F8FAF5] transition-colors"
              >
                <div className={`w-10 h-10 rounded-[13px] ${bg} flex items-center justify-center text-lg shrink-0`}>
                  {emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold text-[#123524] truncate">{disease}</div>
                  <div className="text-[11px] text-[#8A9A8E] mt-0.5 truncate flex items-center gap-1.5">
                    <span>{formatDate(r.createdAt)}</span>
                    <span>·</span>
                    <span>{method.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                    {badge.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#A0ACA0]" />
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
