import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import type { DiseaseAlert, DiseaseHeatmapPoint } from '@/types'

interface DesktopDiseaseAlertsProps {
  diseaseAlerts: DiseaseAlert[]
  heatmap: DiseaseHeatmapPoint[]
  unreadAlertCount: number
}

export function DesktopDiseaseAlerts({
  diseaseAlerts,
  heatmap,
  unreadAlertCount,
}: DesktopDiseaseAlertsProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-[0_1px_2px_rgba(16,36,26,.04),0_4px_12px_rgba(16,36,26,.05)] sm:rounded-[20px] sm:p-5 lg:col-span-4 lg:p-6">
      <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3">
        <div>
          <h3 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-base font-bold text-[#10241A] sm:text-lg">
            Disease Alerts
          </h3>
          <span className="text-[10px] text-[#5C6B60] sm:text-xs">
            Within 25 km of your plantation
          </span>
        </div>
        {unreadAlertCount > 0 && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#FDE7E8] px-2 py-0.5 text-[10px] font-semibold text-[#B3261E] sm:text-[11px]">
            {unreadAlertCount} unread
          </span>
        )}
      </div>

      <div className="my-1 space-y-2 sm:my-2 sm:space-y-2.5">
        {diseaseAlerts.length === 0 && heatmap.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-[#5C6B60] sm:text-xs">
            No outbreaks reported in your area.
          </p>
        ) : diseaseAlerts.length > 0 ? (
          diseaseAlerts.slice(0, 3).map((alert) => {
            const isHigh =
              alert.severity === 'high' || (!alert.read && alert.alertType !== 'ai_suspected')
            return (
              <div
                key={alert.id}
                className="flex items-start gap-2.5 rounded-2xl border border-[#E6EADF] p-2.5 transition-colors hover:border-[#BFD98F] hover:bg-[#F6F7F2]/60 sm:gap-3 sm:p-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm sm:h-9 sm:w-9 sm:text-base ${
                    isHigh ? 'bg-[#FDE7E8]' : 'bg-[#FCF0DA]'
                  }`}
                >
                  {isHigh ? '🚨' : '⚠️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[11px] font-semibold leading-tight text-[#10241A] sm:text-xs lg:text-sm">
                    {alert.diseaseType}
                  </p>
                  <span className="mt-0.5 block text-[10px] text-[#5C6B60] sm:text-[11px]">
                    {alert.distanceKm} km away ·{' '}
                    {alert.alertType === 'ai_suspected' ? 'AI suspected' : 'Verified'}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase sm:px-2 sm:text-[10px] ${
                    isHigh ? 'bg-[#FDE7E8] text-[#B3261E]' : 'bg-[#FCF0DA] text-[#8A5A00]'
                  }`}
                >
                  {isHigh ? 'High' : 'Medium'}
                </span>
              </div>
            )
          })
        ) : (
          heatmap.slice(0, 3).map((point, i) => {
            const isHigh = point.weight >= 0.8
            return (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-2xl border border-[#E6EADF] p-2.5 transition-colors hover:border-[#BFD98F] hover:bg-[#F6F7F2]/60 sm:gap-3 sm:p-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm sm:h-9 sm:w-9 sm:text-base ${
                    isHigh ? 'bg-[#FDE7E8]' : 'bg-[#FCF0DA]'
                  }`}
                >
                  {isHigh ? '🚨' : '⚠️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[11px] font-semibold leading-tight text-[#10241A] sm:text-xs lg:text-sm">
                    {point.diseaseType}
                  </p>
                  <span className="mt-0.5 block text-[10px] text-[#5C6B60] sm:text-[11px]">
                    Coordinates: {point.lat.toFixed(2)}, {point.lng.toFixed(2)}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase sm:px-2 sm:text-[10px] ${
                    isHigh ? 'bg-[#FDE7E8] text-[#B3261E]' : 'bg-[#FCF0DA] text-[#8A5A00]'
                  }`}
                >
                  {isHigh ? 'High' : 'Medium'}
                </span>
              </div>
            )
          })
        )}
      </div>

      <Link
        to="/app/heatmap"
        className="group mt-auto inline-flex items-center gap-1.5 pt-2 text-[11px] font-semibold text-[#123524] hover:text-[#0C281B] sm:pt-3 sm:text-xs"
      >
        View full heatmap
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-3.5 sm:w-3.5" />
      </Link>
    </div>
  )
}
