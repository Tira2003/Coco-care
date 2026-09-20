import { ChevronDown, MapPin } from 'lucide-react'
import type { Farm } from '@/types'

interface FarmWeatherSelectProps {
  farms: Farm[]
  selectedFarmId?: string
  onChange: (farmId: string) => void
  variant?: 'light' | 'dark'
}

export function FarmWeatherSelect({
  farms,
  selectedFarmId,
  onChange,
  variant = 'light',
}: FarmWeatherSelectProps) {
  if (farms.length === 0) return null

  const selected = farms.find((farm) => farm.id === selectedFarmId) ?? farms[0]
  const dark = variant === 'dark'
  const label = selected
    ? `${selected.name}${selected.location ? ` · ${selected.location}` : ''}`
    : 'Select farm'

  if (farms.length === 1) {
    return (
      <div
        className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
          dark ? 'bg-white/15 text-white' : 'border border-[#E6EADF] bg-[#F6F7F2] text-[#123524]'
        }`}
      >
        <MapPin className={`h-3.5 w-3.5 shrink-0 ${dark ? 'text-[#C9F169]' : 'text-[#7FA81B]'}`} />
        <span className="truncate">{label}</span>
      </div>
    )
  }

  return (
    <label className="relative inline-flex min-w-0 max-w-full items-center">
      <MapPin
        className={`pointer-events-none absolute left-3 h-3.5 w-3.5 ${
          dark ? 'text-[#C9F169]' : 'text-[#7FA81B]'
        }`}
      />
      <select
        value={selected?.id ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className={`max-w-[16rem] appearance-none truncate rounded-full py-2 pl-9 pr-9 text-[12px] font-semibold outline-none transition-all ${
          dark
            ? 'bg-white/15 text-white backdrop-blur-md hover:bg-white/25'
            : 'border border-[#E6EADF] bg-white text-[#10241A] shadow-[0_1px_2px_rgba(16,36,26,.04)] hover:border-[#C9D6B8] hover:shadow-sm focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/8'
        }`}
        aria-label="Select farm for weather forecast"
      >
        {farms.map((farm) => (
          <option key={farm.id} value={farm.id} className="text-[#10241A]">
            {farm.name} · {farm.location}
            {farm.isPrimary ? ' (Primary)' : ''}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-3 h-3.5 w-3.5 ${
          dark ? 'text-white/80' : 'text-[#5C6B60]'
        }`}
      />
    </label>
  )
}
