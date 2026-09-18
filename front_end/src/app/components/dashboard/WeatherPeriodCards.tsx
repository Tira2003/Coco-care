import type { ReactNode } from 'react'
import { CalendarDays, CalendarRange, CloudRain, Droplets, Leaf, Wind } from 'lucide-react'
import type { WeatherPeriodSummary } from '@/types'

interface WeatherPeriodCardsProps {
  weekly?: WeatherPeriodSummary
  monthly?: WeatherPeriodSummary
  compact?: boolean
}

export function WeatherPeriodCards({ weekly, monthly, compact }: WeatherPeriodCardsProps) {
  if (!weekly && !monthly) return null

  return (
    <div className={compact ? 'mt-3 grid grid-cols-2 gap-2' : 'mt-4 grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2'}>
      {weekly ? (
        <PeriodCard
          summary={weekly}
          compact={compact}
          icon={<CalendarDays className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
          tone="week"
        />
      ) : null}
      {monthly ? (
        <PeriodCard
          summary={monthly}
          compact={compact}
          icon={<CalendarRange className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
          tone="month"
        />
      ) : null}
    </div>
  )
}

function PeriodCard({
  summary,
  compact,
  icon,
  tone,
}: {
  summary: WeatherPeriodSummary
  compact?: boolean
  icon: ReactNode
  tone: 'week' | 'month'
}) {
  const isWeek = tone === 'week'

  if (compact) {
    return (
      <div
        className={`rounded-2xl border px-2.5 py-2.5 ${
          isWeek
            ? 'border-[#C9F169]/40 bg-[#0B2A36]/40'
            : 'border-[#7EC8E3]/35 bg-[#0B2A36]/40'
        }`}
      >
        <div className="flex items-center gap-1.5 text-[#C9F169]">
          {icon}
          <span className="text-[10px] font-bold uppercase tracking-wider">{summary.title}</span>
        </div>
        <p className="mt-0.5 text-[9px] font-medium text-white/65">{summary.period}</p>
        <p className="mt-1.5 font-['Bricolage_Grotesque',Inter,sans-serif] text-[15px] font-bold leading-none">
          {summary.avgHigh}°
          <span className="ml-1 text-[11px] font-medium text-white/60">{summary.avgLow}°</span>
        </p>
        <p className="mt-1 text-[10px] font-semibold text-[#D6ECFF]">
          {summary.totalRainMm} mm · {summary.rainDays} wet
        </p>
        <p className="mt-1 line-clamp-2 text-[9px] font-medium leading-snug text-[#EAF8B8]">
          {summary.headline}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-[20px] border p-4 ${
        isWeek
          ? 'border-[#C5DC9A] bg-gradient-to-br from-[#F3F8EC] to-[#EAF4D4]'
          : 'border-[#C5D9EE] bg-gradient-to-br from-[#EEF6FF] to-[#E3F0FB]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isWeek ? 'bg-[#123524]/10 text-[#123524]' : 'bg-[#2F80ED]/10 text-[#1D5BB8]'
            }`}
          >
            {icon}
            {summary.title}
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-[#5C6B60]">{summary.period}</p>
        </div>
        <div className="text-right">
          <p className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[22px] font-bold leading-none text-[#10241A]">
            {summary.avgHigh}°
            <span className="ml-1 text-[13px] font-medium text-[#5C6B60]">{summary.avgLow}°</span>
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#5C6B60]">
            Avg high / low
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatChip
          icon={<CloudRain className="h-3.5 w-3.5" />}
          value={`${summary.totalRainMm} mm`}
          label={`${summary.rainDays} wet · ${summary.dryDays} dry`}
          tone={tone}
        />
        <StatChip
          icon={<Leaf className="h-3.5 w-3.5" />}
          value={`${summary.sprayOkDays} days`}
          label="Spray-ok windows"
          tone={tone}
        />
        <StatChip
          icon={<Droplets className="h-3.5 w-3.5" />}
          value={`${summary.avgHumidity}%`}
          label="Avg humidity"
          tone={tone}
        />
        <StatChip
          icon={<Wind className="h-3.5 w-3.5" />}
          value={`${summary.avgWind} km/h`}
          label={`Wettest ${summary.wettestDay}`}
          tone={tone}
        />
      </div>

      <p
        className={`mt-auto pt-3 text-[12px] font-semibold leading-relaxed ${
          isWeek ? 'text-[#123524]' : 'text-[#1D4E6B]'
        }`}
      >
        {summary.headline}
      </p>
    </div>
  )
}

function StatChip({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode
  value: string
  label: string
  tone: 'week' | 'month'
}) {
  return (
    <div
      className={`rounded-2xl px-2.5 py-2 ${
        tone === 'week' ? 'bg-white/70' : 'bg-white/80'
      }`}
    >
      <div className={tone === 'week' ? 'text-[#3D6A3A]' : 'text-[#2F80ED]'}>{icon}</div>
      <div className="mt-1 text-[13px] font-extrabold leading-tight text-[#10241A]">{value}</div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-[#5C6B60]">{label}</div>
    </div>
  )
}
