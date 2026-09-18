import {
  Leaf,
  ClipboardList,
  CheckCircle2,
  Clock,
  RotateCcw,
  Cloud,
  CloudRain,
  Shield,
} from 'lucide-react'

interface DesktopStatsCardsProps {
  healthScore: string
  healthyPercent: number
  healthyPalms: number
  treatingPercent: number
  treatingPalms: number
  atRiskPercent: number
  atRiskPalms: number
  reportsCount: number
  verifiedReportsCount: number
  pendingReportsCount: number
  recoveredCount: number
  weatherLocation: string
  currentTemp: number
  weatherDescription: string
  weatherHumidity: number
  rainText: string
  riskLabel: string
  riskColor: string
}

export function DesktopStatsCards({
  healthScore,
  healthyPercent,
  healthyPalms,
  treatingPercent,
  treatingPalms,
  atRiskPercent,
  atRiskPalms,
  reportsCount,
  verifiedReportsCount,
  pendingReportsCount,
  recoveredCount,
  weatherLocation,
  currentTemp,
  weatherDescription,
  weatherHumidity,
  rainText,
  riskLabel,
  riskColor,
}: DesktopStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {/* Card 1: Palm health */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-[0_1px_2px_rgba(16,36,26,.04),0_4px_12px_rgba(16,36,26,.05)] sm:rounded-[20px] sm:p-5 lg:p-6">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#10241A] sm:text-sm">
            <Leaf className="h-4 w-4 text-[#3DA35D]" />
            <span>Palm health</span>
          </div>

          <div className="mt-3 sm:mt-4">
            <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[28px] font-bold leading-none tracking-tight text-[#10241A] sm:text-3xl lg:text-4xl">
              {healthScore}%
            </div>
            <p className="mt-1 text-[11px] text-[#5C6B60] sm:text-xs lg:text-sm">
              up 4.2% this season
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-2.5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm">
            <span className="w-14 shrink-0 font-medium text-[#5C6B60] sm:w-16">Healthy</span>
            <div className="mx-2 h-1.5 flex-1 overflow-hidden rounded-full bg-[#E6EADF] sm:mx-3">
              <div
                className="h-full rounded-full bg-[#3DA35D]"
                style={{ width: `${healthyPercent}%` }}
              />
            </div>
            <span className="w-10 text-right font-semibold text-[#10241A] tabular-nums sm:w-12">
              {healthyPalms.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm">
            <span className="w-14 shrink-0 font-medium text-[#5C6B60] sm:w-16">Treating</span>
            <div className="mx-2 h-1.5 flex-1 overflow-hidden rounded-full bg-[#E6EADF] sm:mx-3">
              <div
                className="h-full rounded-full bg-[#F5A524]"
                style={{ width: `${Math.max(8, treatingPercent)}%` }}
              />
            </div>
            <span className="w-10 text-right font-semibold text-[#10241A] tabular-nums sm:w-12">
              {treatingPalms.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm">
            <span className="w-14 shrink-0 font-medium text-[#5C6B60] sm:w-16">At risk</span>
            <div className="mx-2 h-1.5 flex-1 overflow-hidden rounded-full bg-[#E6EADF] sm:mx-3">
              <div
                className="h-full rounded-full bg-[#E5484D]"
                style={{ width: `${Math.max(5, atRiskPercent)}%` }}
              />
            </div>
            <span className="w-10 text-right font-semibold text-[#10241A] tabular-nums sm:w-12">
              {atRiskPalms.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Active reports */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-[0_1px_2px_rgba(16,36,26,.04),0_4px_12px_rgba(16,36,26,.05)] sm:rounded-[20px] sm:p-5 lg:p-6">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#10241A] sm:text-sm">
            <ClipboardList className="h-4 w-4 text-[#3B82F6]" />
            <span>Active reports</span>
          </div>

          <div className="mt-3 sm:mt-4">
            <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[28px] font-bold leading-none tracking-tight text-[#10241A] sm:text-3xl lg:text-4xl">
              {reportsCount}
            </div>
            <p className="mt-1 text-[11px] text-[#5C6B60] sm:text-xs lg:text-sm">
              submitted in the last 30 days
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-2.5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm">
            <span className="flex items-center gap-1.5 font-medium text-[#10241A] sm:gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#3DA35D] sm:h-4 sm:w-4" />
              <span>Verified</span>
            </span>
            <span className="font-semibold text-[#10241A] tabular-nums">
              {verifiedReportsCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm">
            <span className="flex items-center gap-1.5 font-medium text-[#10241A] sm:gap-2">
              <Clock className="h-3.5 w-3.5 text-[#F5A524] sm:h-4 sm:w-4" />
              <span>In review</span>
            </span>
            <span className="font-semibold text-[#10241A] tabular-nums">
              {pendingReportsCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm">
            <span className="flex items-center gap-1.5 font-medium text-[#10241A] sm:gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-[#3B82F6] sm:h-4 sm:w-4" />
              <span>Recovered</span>
            </span>
            <span className="font-semibold text-[#10241A] tabular-nums">
              {recoveredCount || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Weather */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-[0_1px_2px_rgba(16,36,26,.04),0_4px_12px_rgba(16,36,26,.05)] sm:rounded-[20px] sm:p-5 md:col-span-2 lg:col-span-1 lg:p-6">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#10241A] sm:text-sm">
            <Cloud className="h-4 w-4 text-[#5C6B60]" />
            <span>Weather · {weatherLocation}</span>
          </div>

          <div className="mt-3 sm:mt-4">
            <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[28px] font-bold leading-none tracking-tight text-[#10241A] sm:text-3xl lg:text-4xl">
              {currentTemp}°
            </div>
            <p className="mt-1 text-[11px] text-[#5C6B60] capitalize sm:text-xs lg:text-sm">
              {weatherDescription} · {weatherHumidity}% humidity
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-2.5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm">
            <span className="flex items-center gap-1.5 font-medium text-[#10241A] sm:gap-2">
              <CloudRain className="h-3.5 w-3.5 text-[#3B82F6] sm:h-4 sm:w-4" />
              <span>Rain</span>
            </span>
            <span className="font-semibold text-[#10241A]">
              {rainText}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm">
            <span className="flex items-center gap-1.5 font-medium text-[#10241A] sm:gap-2">
              <Shield className="h-3.5 w-3.5 text-[#3DA35D] sm:h-4 sm:w-4" />
              <span>Disease risk</span>
            </span>
            <span className={`font-bold ${riskColor}`}>
              {riskLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
