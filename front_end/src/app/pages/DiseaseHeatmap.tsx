import { AlertTriangle, Filter, Loader2, MapPin, ShieldAlert, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { diseaseMapApi, farmApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import { DiseaseMap, pointKey, threatColor, threatFromWeight } from '@/app/components/DiseaseMap'
import {
  applyHeatmapFilters,
  hasActiveFilters,
  pointThreat,
  THREAT_FILTERS,
  threatFilterLabel,
  threatLabel,
  todayStamp,
  type HeatmapFilterState,
} from '@/app/diseaseMapFilters'
import { SRI_LANKA_DISTRICTS } from '@/constants/districts'
import type { HeatmapPoint } from '@/types'
import { readSelectedFarmId, resolveSelectedFarm } from '@/lib/selectedFarm'

function verificationLabel(status: HeatmapPoint['verificationStatus']) {
  return status === 'ai_suspected' ? 'AI suspected' : 'Verified'
}

export function DiseaseHeatmap() {
  const { user } = useAuth()
  const isOfficer = user?.role === 'officer'
  const [diseaseFilter, setDiseaseFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [minWeight, setMinWeight] = useState<number | undefined>(undefined)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [focusedPoint, setFocusedPoint] = useState<HeatmapPoint | null>(null)
  const [focusedKey, setFocusedKey] = useState<string | null>(null)
  const prefilledRegion = useRef(false)

  const { data: profile } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
    enabled: !isOfficer,
  })

  const selectedFarmId = useMemo(() => {
    const farms = profile?.farms ?? []
    return resolveSelectedFarm(farms, readSelectedFarmId())?.id
  }, [profile?.farms])

  const dateRangeInvalid = Boolean(fromDate && toDate && fromDate > toDate)
  const today = todayStamp()

  const filterState = useMemo<HeatmapFilterState>(() => {
    const next: HeatmapFilterState = {}
    if (diseaseFilter.trim()) next.diseaseType = diseaseFilter.trim()
    if (districtFilter.trim()) next.district = districtFilter.trim()
    if (minWeight != null) next.minWeight = minWeight
    if (!dateRangeInvalid) {
      if (fromDate) next.from = fromDate
      if (toDate) next.to = toDate
    }
    return next
  }, [diseaseFilter, districtFilter, minWeight, fromDate, toDate, dateRangeInvalid])

  const filtersActive = hasActiveFilters(filterState)

  const { data: heatmapAll = [], isLoading } = useQuery({
    queryKey: ['disease-map', 'heatmap'],
    queryFn: () => diseaseMapApi.heatmap(),
  })

  const { data: stats } = useQuery({
    queryKey: ['disease-map', 'stats'],
    queryFn: () => diseaseMapApi.stats(),
  })

  const { data: nearby } = useQuery({
    queryKey: ['disease-map', 'nearby', selectedFarmId],
    queryFn: () => diseaseMapApi.nearby(25),
    enabled: !isOfficer,
  })

  useEffect(() => {
    if (prefilledRegion.current) return
    const region = user?.assignedRegion?.trim()
    if (!isOfficer || !region) return
    setDistrictFilter(region)
    prefilledRegion.current = true
  }, [isOfficer, user?.assignedRegion])

  const heatmap = useMemo(
    () => applyHeatmapFilters(heatmapAll, filterState),
    [heatmapAll, filterState],
  )

  const diseaseOptions = useMemo(() => {
    const fromStats = stats?.byDisease.map((row) => row.diseaseType) ?? []
    const fromPoints = heatmapAll.map((point) => point.diseaseType)
    return [...new Set([...fromStats, ...fromPoints])].sort((a, b) => a.localeCompare(b))
  }, [stats, heatmapAll])

  const districtsWithOutbreaks = useMemo(
    () =>
      [...new Set(heatmapAll.map((point) => point.district).filter((district): district is string => Boolean(district)))]
        .sort((a, b) => a.localeCompare(b)),
    [heatmapAll],
  )
  const remainingDistricts = useMemo(
    () => SRI_LANKA_DISTRICTS.filter((district) => !districtsWithOutbreaks.includes(district)),
    [districtsWithOutbreaks],
  )

  const highRiskCount = heatmap.filter((point) => {
    const level = pointThreat(point)
    return level === 'high' || level === 'critical'
  }).length
  const radiusKm = nearby?.radiusKm ?? 25
  const watchFarms = nearby?.farms ?? []
  const nearbyOutbreaks = watchFarms.flatMap((farm) =>
    farm.outbreaks.map((outbreak) => ({ ...outbreak, farmName: farm.farmName })),
  )
  const nearbyReportIds = useMemo(
    () => new Set(nearbyOutbreaks.map((outbreak) => outbreak.reportId)),
    [nearbyOutbreaks],
  )
  const nearbyClusterKeys = useMemo(
    () => new Set(nearbyOutbreaks.map((outbreak) => `${outbreak.farmId ?? ''}:${outbreak.diseaseType}`)),
    [nearbyOutbreaks],
  )

  useEffect(() => {
    if (!focusedKey) return
    if (heatmap.some((point) => pointKey(point) === focusedKey)) return
    setFocusedPoint(null)
    setFocusedKey(null)
  }, [heatmap, focusedKey])

  const selectDistrict = (district: string) => {
    setDistrictFilter(district)
    setFocusedPoint(null)
    setFocusedKey(null)
  }

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
    setFocusedPoint(point)
    setFocusedKey(pointKey(point))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] mb-1 text-2xl font-bold text-[#10241A] sm:mb-2 sm:text-3xl">
          Disease Heatmap & Risk Monitoring
        </h1>
        <p className="text-sm text-[#5C6B60] sm:text-base">
          {isOfficer
            ? 'Verified and suspected coconut outbreaks across Sri Lanka. Filter to your district when you need a local view.'
            : `Identify coconut diseases, threat level, and outbreaks inside a ${radiusKm} km radius of your farm.`}
        </p>
      </div>

      <div className="rounded-2xl border border-[#E6EADF] bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#10241A]">
            <Filter className="h-4 w-4" />
            Filter outbreaks
          </div>
          <p className="text-xs font-semibold text-[#5C6B60]">
            Showing {heatmap.length} of {heatmapAll.length} outbreak{heatmapAll.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex w-full flex-col gap-1 text-xs font-semibold text-[#5C6B60] sm:w-auto">
            Disease
            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-[#E6EADF] bg-white px-3 py-2 text-sm font-medium text-[#10241A] sm:w-auto sm:min-w-[12rem]"
            >
              <option value="">All diseases</option>
              {diseaseOptions.map((disease) => (
                <option key={disease} value={disease}>
                  {disease}
                </option>
              ))}
            </select>
          </label>
          <label className="flex w-full flex-col gap-1 text-xs font-semibold text-[#5C6B60] sm:w-auto">
            District
            <select
              value={districtFilter}
              onChange={(e) => selectDistrict(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-[#E6EADF] bg-white px-3 py-2 text-sm font-medium text-[#10241A] sm:w-auto sm:min-w-[11rem]"
            >
              <option value="">All districts</option>
              {districtsWithOutbreaks.length > 0 ? (
                <optgroup label="With outbreaks">
                  {districtsWithOutbreaks.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              {remainingDistricts.length > 0 ? (
                <optgroup label="All districts">
                  {remainingDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </label>
          <label className="flex w-full flex-col gap-1 text-xs font-semibold text-[#5C6B60] sm:w-auto">
            Threat
            <select
              value={minWeight ?? ''}
              onChange={(e) => setMinWeight(e.target.value ? Number(e.target.value) : undefined)}
              className="min-h-11 w-full rounded-xl border border-[#E6EADF] bg-white px-3 py-2 text-sm font-medium text-[#10241A] sm:w-auto sm:min-w-[12rem]"
            >
              <option value="">All threat levels</option>
              {THREAT_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex w-full flex-col gap-1 text-xs font-semibold text-[#5C6B60] sm:w-auto">
            From
            <input
              type="date"
              value={fromDate}
              max={toDate || today}
              onChange={(e) => setFromDate(e.target.value)}
              className="min-h-11 rounded-xl border border-[#E6EADF] bg-white px-3 py-2 text-sm font-medium text-[#10241A]"
            />
          </label>
          <label className="flex w-full flex-col gap-1 text-xs font-semibold text-[#5C6B60] sm:w-auto">
            To
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              max={today}
              onChange={(e) => setToDate(e.target.value)}
              className="min-h-11 rounded-xl border border-[#E6EADF] bg-white px-3 py-2 text-sm font-medium text-[#10241A]"
            />
          </label>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!filtersActive && !dateRangeInvalid}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#123524] px-4 py-2 text-sm font-bold text-[#123524] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            Clear filters
          </button>
        </div>

        {filtersActive ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filterState.diseaseType ? (
              <FilterChip label={filterState.diseaseType} onRemove={() => setDiseaseFilter('')} />
            ) : null}
            {filterState.district ? (
              <FilterChip label={filterState.district} onRemove={() => selectDistrict('')} />
            ) : null}
            {filterState.minWeight != null ? (
              <FilterChip
                label={threatFilterLabel(filterState.minWeight)}
                onRemove={() => setMinWeight(undefined)}
              />
            ) : null}
            {filterState.from ? (
              <FilterChip label={`From ${filterState.from}`} onRemove={() => setFromDate('')} />
            ) : null}
            {filterState.to ? (
              <FilterChip label={`To ${filterState.to}`} onRemove={() => setToDate('')} />
            ) : null}
          </div>
        ) : null}
      </div>

      {dateRangeInvalid ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          “From” date must be on or before the “To” date. Date filters are paused until that is fixed.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#E6EADF] bg-white p-3 shadow-sm sm:p-5 lg:col-span-2">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
                Sri Lanka disease distribution
              </h2>
              <p className="text-xs text-[#5C6B60]">
                {isOfficer
                  ? 'Heat intensity follows confidence. Red is officer-verified; amber is still under review.'
                  : `Heat intensity follows confidence. Lime ring is your ${radiusKm} km watch zone.`}
              </p>
            </div>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-[#123524]" /> : null}
          </div>
          <DiseaseMap
            points={heatmap}
            focusedPoint={focusedPoint}
            farms={isOfficer ? [] : watchFarms}
            radiusKm={isOfficer ? undefined : radiusKm}
            nearbyReportIds={isOfficer ? new Set() : nearbyReportIds}
            nearbyClusterKeys={isOfficer ? new Set() : nearbyClusterKeys}
            selectedDistrict={districtFilter || null}
            onSelectPoint={focusOutbreak}
          />
        </div>

        <div className="space-y-4">
          {isOfficer ? (
            <div className="rounded-2xl bg-gradient-to-br from-[#123524] to-[#1B4332] p-5 text-white shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
                <ShieldAlert className="h-4 w-4" />
                District desk
              </div>
              <div className="mb-1 text-3xl font-bold">{heatmap.length}</div>
              <p className="text-sm text-white/85">
                {districtFilter
                  ? `Mapped outbreaks currently shown for ${districtFilter}.`
                  : 'Island-wide outbreaks. Filter to your assigned district when you need a local view.'}
              </p>
            </div>
          ) : (
          <div
            className={`rounded-2xl p-5 text-white shadow-sm ${
              nearbyOutbreaks.length > 0
                ? 'bg-gradient-to-br from-[#B3261E] to-[#E5484D]'
                : 'bg-gradient-to-br from-[#123524] to-[#1B4332]'
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
              <ShieldAlert className="h-4 w-4" />
              {radiusKm} km warning
            </div>
            <div className="mb-1 text-3xl font-bold">{nearbyOutbreaks.length}</div>
            <p className="text-sm text-white/85">
              {nearbyOutbreaks.length > 0
                ? `Active outbreak${nearbyOutbreaks.length === 1 ? '' : 's'} inside your farm watch radius.`
                : nearby?.nearest
                  ? `No threat within ${radiusKm} km. Nearest is ${nearby.nearest.diseaseType} at ${nearby.nearest.distanceKm} km.`
                  : `No mapped outbreaks inside ${radiusKm} km of your farm.`}
            </p>
          </div>
          )}

          <div className="rounded-2xl border border-[#E6EADF] bg-white p-5 shadow-sm">
            <h3 className="mb-1 font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              High / critical threats
            </h3>
            <div className="mb-1 text-3xl font-bold text-[#B3261E]">{highRiskCount}</div>
            <p className="text-xs text-[#5C6B60]">
              {filtersActive
                ? 'High or critical threats in the current filter view.'
                : 'Island-wide reports at 70% confidence or higher.'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-1 font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              Outbreaks
            </h3>
            <p className="mb-3 text-xs text-[#5C6B60]">Tap a disease to locate it and read threat level.</p>
            <div className="max-h-[320px] space-y-2 overflow-y-auto">
              {heatmap.length === 0 ? (
                <p className="text-sm text-[#5C6B60]">
                  {heatmapAll.length === 0
                    ? 'No outbreak data is mapped yet.'
                    : 'No outbreaks match these filters. Clear a chip or choose another district.'}
                </p>
              ) : (
                heatmap.map((point) => (
                  <OutbreakPointCard
                    key={pointKey(point)}
                    point={point}
                    selected={pointKey(point) === focusedKey}
                    inWatchZone={
                      !isOfficer &&
                      (Boolean(point.reportId && nearbyReportIds.has(point.reportId)) ||
                        nearbyClusterKeys.has(`${point.farmId ?? ''}:${point.diseaseType}`))
                    }
                    onSelect={() => focusOutbreak(point)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {isOfficer ? null : (
      <div className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
          Nearby outbreak alerts · {radiusKm} km
        </h2>
        {nearbyOutbreaks.length === 0 ? (
          <p className="text-sm text-[#5C6B60]">
            {nearby?.nearest
              ? `Clear within ${radiusKm} km. Closest mapped case: ${nearby.nearest.diseaseType} (${nearby.nearest.distanceKm} km, ${nearby.nearest.farmName}).`
              : 'No nearby outbreak warnings right now. Keep the heatmap open after new diagnoses.'}
          </p>
        ) : (
          <div className="space-y-3">
            {nearbyOutbreaks.slice(0, 8).map((outbreak) => {
              const level = outbreak.threatLevel ?? threatFromWeight(outbreak.weight)
              return (
                <div
                  key={`${outbreak.reportId}-${outbreak.farmName}`}
                  className="rounded-xl border border-[#E6EADF] bg-[#FBFCF9] p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: threatColor(level) }} />
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-[#10241A]">{outbreak.diseaseType}</h4>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                          style={{ background: threatColor(level) }}
                        >
                          {threatLabel(level)}
                        </span>
                        <span className="rounded-full bg-[#EDF3E0] px-2 py-0.5 text-[10px] font-bold text-[#123524]">
                          {verificationLabel(outbreak.verificationStatus)}
                        </span>
                      </div>
                      <p className="text-sm text-[#5C6B60]">
                        {outbreak.distanceKm} km from {outbreak.farmName} · {Math.round(outbreak.weight * 100)}%
                        confidence
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      )}
    </div>
  )
}

type OutbreakPointCardProps = {
  point: HeatmapPoint
  selected: boolean
  inWatchZone: boolean
  onSelect: () => void
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full bg-[#EDF3E0] px-2.5 py-1 text-[11px] font-bold text-[#123524]"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  )
}

function OutbreakPointCard({ point, selected, inWatchZone, onSelect }: OutbreakPointCardProps) {
  const level = point.threatLevel ?? threatFromWeight(point.weight)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl p-3 text-left transition-colors ${
        selected
          ? 'border-2 border-[#123524] bg-[#EDF3E0] ring-1 ring-[#123524]/20'
          : 'border-2 border-transparent bg-[#F6F7F2] hover:border-[#C9F169]'
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="text-sm font-bold text-[#10241A]">{point.diseaseType}</div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
          style={{ background: threatColor(level) }}
        >
          {threatLabel(level)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#5C6B60]">
        <MapPin className="h-3 w-3" />
        <span>
          {point.district ?? `${point.lat.toFixed(2)}, ${point.lng.toFixed(2)}`}
          {point.farmName ? ` · ${point.farmName}` : ''}
        </span>
        <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-[#123524]">
          {verificationLabel(point.verificationStatus)}
        </span>
        {inWatchZone ? (
          <span className="rounded bg-[#FDE7E8] px-1.5 py-0.5 font-semibold text-[#B3261E]">Within 25 km</span>
        ) : null}
      </div>
    </button>
  )
}
