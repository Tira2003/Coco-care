import { AlertTriangle, Filter, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { diseaseMapApi } from '@/api/services'
import { DiseaseMap, pointKey } from '@/app/components/DiseaseMap'
import { SRI_LANKA_DISTRICTS } from '@/constants/districts'
import type { HeatmapFilters, HeatmapPoint } from '@/types'

export function riskLevel(weight: number) {
  if (weight >= 0.7) return 'high'
  if (weight >= 0.6) return 'medium'
  return 'low'
}

function verificationLabel(status: HeatmapPoint['verificationStatus']) {
  return status === 'ai_suspected' ? 'AI suspected' : 'Verified'
}

export function DiseaseHeatmap() {
  const [diseaseFilter, setDiseaseFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [minWeight, setMinWeight] = useState<number | undefined>(undefined)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [focusedPoint, setFocusedPoint] = useState<HeatmapPoint | null>(null)
  const [focusedKey, setFocusedKey] = useState<string | null>(null)

  const dateRangeInvalid = Boolean(fromDate && toDate && fromDate > toDate)

  const filters = useMemo<HeatmapFilters | undefined>(() => {
    if (dateRangeInvalid) return undefined
    const next: HeatmapFilters = {}
    if (diseaseFilter.trim()) next.diseaseType = diseaseFilter.trim()
    if (districtFilter.trim()) next.district = districtFilter.trim()
    if (minWeight != null) next.minWeight = minWeight
    if (fromDate) next.from = `${fromDate}T00:00:00.000Z`
    if (toDate) next.to = `${toDate}T23:59:59.999Z`
    return Object.keys(next).length > 0 ? next : undefined
  }, [diseaseFilter, districtFilter, minWeight, fromDate, toDate, dateRangeInvalid])

  const { data: heatmap = [], isLoading } = useQuery({
    queryKey: ['disease-map', 'heatmap', filters],
    queryFn: () => diseaseMapApi.heatmap(filters),
    enabled: !dateRangeInvalid,
  })

  const { data: nearby } = useQuery({
    queryKey: ['disease-map', 'nearby'],
    queryFn: () => diseaseMapApi.nearby(),
  })

  const diseaseOptions = useMemo(
    () => [...new Set(heatmap.map((p) => p.diseaseType))].sort(),
    [heatmap],
  )
  const highRiskCount = heatmap.filter((p) => p.weight >= 0.7).length

  const nearbyOutbreaks = nearby?.farms.flatMap((f) =>
    f.outbreaks.map((o) => ({ ...o, farmName: f.farmName })),
  ) ?? []

  const clearFilters = () => {
    setDiseaseFilter('')
    setDistrictFilter('')
    setMinWeight(undefined)
    setFromDate('')
    setToDate('')
    setFocusedPoint(null)
    setFocusedKey(null)
  }

  const focusOutbreak = (point: HeatmapPoint) => {
    const key = pointKey(point)
    setFocusedPoint(point)
    setFocusedKey(key)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="mb-1 text-2xl text-[#1a2e1a] sm:mb-2 sm:text-3xl">
          Disease Heatmap & Risk Monitoring
        </h1>
        <p className="text-sm text-[#6b7c6b] sm:text-base">
          Monitor disease spread across Sri Lanka from verified cases and high-confidence AI-suspected
          reports.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <select
          value={diseaseFilter}
          onChange={(e) => setDiseaseFilter(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base sm:w-auto sm:min-w-[10rem] sm:px-4 sm:text-sm"
        >
          <option value="">All Diseases</option>
          {diseaseOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base sm:w-auto sm:min-w-[10rem] sm:px-4 sm:text-sm"
        >
          <option value="">All Districts</option>
          {SRI_LANKA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={minWeight ?? ''}
          onChange={(e) => setMinWeight(e.target.value ? Number(e.target.value) : undefined)}
          className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base sm:w-auto sm:min-w-[10rem] sm:px-4 sm:text-sm"
        >
          <option value="">All risk levels</option>
          <option value="0.6">Medium+ (≥ 60%)</option>
          <option value="0.7">High (≥ 70%)</option>
          <option value="0.8">Critical (≥ 80%)</option>
        </select>
        <label className="flex w-full flex-col gap-1 text-sm text-[#6b7c6b] sm:w-auto">
          From
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 py-2 text-base sm:px-4 sm:text-sm"
          />
        </label>
        <label className="flex w-full flex-col gap-1 text-sm text-[#6b7c6b] sm:w-auto">
          To
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 py-2 text-base sm:px-4 sm:text-sm"
          />
        </label>
        <button
          type="button"
          onClick={clearFilters}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#2d5f2e] px-4 py-2 text-[#2d5f2e] sm:w-auto"
        >
          <Filter className="h-4 w-4" />
          Clear filters
        </button>
      </div>

      {dateRangeInvalid ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          &quot;From&quot; date must be on or before the &quot;To&quot; date.
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#2d5f2e]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-green-100 bg-white p-3 shadow-sm sm:p-6 lg:col-span-2">
            <h2 className="mb-3 text-lg text-[#1a2e1a] sm:mb-4 sm:text-xl">
              Sri Lanka Disease Distribution
            </h2>
            {heatmap.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center rounded-xl bg-gray-50 px-4 text-center text-sm text-gray-500 sm:h-[500px]">
                No outbreak data matches the current filters.
              </div>
            ) : (
              <DiseaseMap points={heatmap} focusedPoint={focusedPoint} />
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-sm sm:p-6">
              <h3 className="mb-2 text-lg">High Risk Alerts</h3>
              <div className="mb-1 text-3xl">{highRiskCount}</div>
              <p className="text-sm text-red-100">
                Visible outbreak reports with confidence at least 70%
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-2 text-lg text-[#1a2e1a] sm:mb-4">Outbreak Points</h3>
              <p className="mb-3 text-xs text-[#6b7c6b]">Click an outbreak to locate it on the map.</p>
              <div className="max-h-[280px] space-y-3 overflow-y-auto sm:max-h-[360px]">
                {heatmap.length === 0 ? (
                  <p className="text-sm text-gray-500">No outbreaks to display.</p>
                ) : (
                  heatmap.map((point) => (
                    <OutbreakPointCard
                      key={pointKey(point)}
                      point={point}
                      selected={pointKey(point) === focusedKey}
                      onSelect={() => focusOutbreak(point)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {nearbyOutbreaks.length > 0 && (
        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg text-[#1a2e1a] sm:text-xl">Nearby Outbreak Alerts</h2>
          <div className="space-y-3">
            {nearbyOutbreaks.slice(0, 5).map((outbreak, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 sm:p-4 ${
                  outbreak.verificationStatus === 'ai_suspected'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      outbreak.verificationStatus === 'ai_suspected'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900">{outbreak.diseaseType}</h4>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          outbreak.verificationStatus === 'ai_suspected'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {verificationLabel(outbreak.verificationStatus)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {outbreak.distanceKm} km from {outbreak.farmName} - intensity{' '}
                      {Math.round(outbreak.weight * 100)}%
                      {outbreak.verificationStatus === 'ai_suspected'
                        ? '. This case has not been officer verified yet.'
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type OutbreakPointCardProps = {
  point: HeatmapPoint
  selected: boolean
  onSelect: () => void
}

function OutbreakPointCard({ point, selected, onSelect }: OutbreakPointCardProps) {
  const risk = riskLevel(point.weight)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        selected
          ? 'bg-green-50 border-2 border-[#2d5f2e] ring-1 ring-[#2d5f2e]/20'
          : 'bg-gray-50 border-2 border-transparent hover:bg-green-50/50 hover:border-green-100'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-medium text-gray-900 text-sm">{point.diseaseType}</div>
        <div className="flex flex-wrap justify-end gap-1">
          <span className={`px-2 py-0.5 rounded text-xs ${
            risk === 'high' ? 'bg-red-100 text-red-700' :
            risk === 'medium' ? 'bg-orange-100 text-orange-700' :
            'bg-green-100 text-green-700'
          }`}>
            {risk}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              point.verificationStatus === 'ai_suspected'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {verificationLabel(point.verificationStatus)}
          </span>
        </div>
      </div>
      <div className="text-xs text-gray-500">{point.lat.toFixed(2)}, {point.lng.toFixed(2)}</div>
    </button>
  )
}
