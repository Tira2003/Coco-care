import { MapPin, Sprout } from 'lucide-react'
import type { Farm } from '@/types'

export function FarmSelector({
  farms,
  selectedFarmId,
  onSelect,
}: {
  farms: Farm[]
  selectedFarmId: string
  onSelect: (id: string) => void
}) {
  if (farms.length <= 1) {
    const farm = farms[0]
    if (!farm) return null
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50/60 px-4 py-3 text-sm">
        <Sprout className="h-4 w-4 shrink-0 text-[#2d5f2e]" />
        <span className="font-medium text-gray-900">{farm.name}</span>
        <span className="text-gray-500">·</span>
        <span className="flex items-center gap-1 text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          {farm.location}
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {farms.map((farm) => {
        const selected = farm.id === selectedFarmId
        return (
          <button
            key={farm.id}
            type="button"
            onClick={() => onSelect(farm.id)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              selected
                ? 'border-[#2d5f2e] bg-green-50 ring-1 ring-[#2d5f2e]/20'
                : 'border-green-100 bg-white hover:border-green-200 hover:bg-green-50/50'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                selected ? 'bg-[#2d5f2e] text-white' : 'bg-green-100 text-[#2d5f2e]'
              }`}
            >
              <Sprout className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900">{farm.name}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {farm.location}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
