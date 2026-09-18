import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { farmApi, reportsApi, diseaseMapApi, weatherApi } from '@/api/services'
import {
  getTimeBasedGreeting,
  MobileWeatherHero,
  MobileTwinStats,
  MobileQuickActions,
  MobileRecentDetections,
  MobileTipOfDay,
  DesktopStatsCards,
  DesktopQuickActions,
  DesktopRecentDiagnoses,
  DesktopDiseaseAlerts,
  DesktopWeatherForecast,
} from '../components/dashboard'

const SELECTED_FARM_KEY = 'coco_selected_farm'

export function Dashboard() {
  const { user } = useAuth()
  const greeting = getTimeBasedGreeting()
  const [selectedFarmId, setSelectedFarmId] = useState<string>(() => {
    try {
      return localStorage.getItem(SELECTED_FARM_KEY) ?? ''
    } catch {
      return ''
    }
  })

  const { data: profile } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

  const farms = profile?.farms ?? []
  const selectedFarm =
    farms.find((farm) => farm.id === selectedFarmId) ?? farms[0]
  const farmRegion = selectedFarm?.location ?? 'Kurunegala'
  const totalFarmsCount = farms.length

  useEffect(() => {
    if (!farms.length) return
    const exists = farms.some((farm) => farm.id === selectedFarmId)
    if (!exists) {
      const nextId = farms[0]?.id ?? ''
      setSelectedFarmId(nextId)
      try {
        if (nextId) localStorage.setItem(SELECTED_FARM_KEY, nextId)
      } catch {
        /* ignore */
      }
    }
  }, [farms, selectedFarmId])

  const handleSelectFarm = (farmId: string) => {
    setSelectedFarmId(farmId)
    try {
      localStorage.setItem(SELECTED_FARM_KEY, farmId)
    } catch {
      /* ignore */
    }
  }

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', 'my'],
    queryFn: reportsApi.my,
  })

  const { data: heatmap = [] } = useQuery({
    queryKey: ['disease-map', 'heatmap'],
    queryFn: () => diseaseMapApi.heatmap(),
  })

  const { data: diseaseAlerts = [] } = useQuery({
    queryKey: ['disease-map', 'alerts'],
    queryFn: diseaseMapApi.alerts,
  })

  const unreadAlertCount = diseaseAlerts.filter((a) => !a.read).length

  const {
    data: weather,
    isLoading: weatherLoading,
    isError: weatherError,
    error: weatherQueryError,
  } = useQuery({
    queryKey: ['weather', 'forecast', selectedFarm?.id],
    queryFn: () =>
      weatherApi.forecast({
        farmId: selectedFarm?.id,
        lat: selectedFarm?.latitude,
        lon: selectedFarm?.longitude,
        location: selectedFarm?.location,
      }),
    enabled: Boolean(selectedFarm),
    staleTime: 1000 * 60 * 20,
    retry: 1,
  })

  const weatherErrorMessage =
    weatherQueryError && typeof weatherQueryError === 'object' && 'response' in weatherQueryError
      ? (weatherQueryError as { response?: { data?: { message?: string } } }).response?.data?.message
      : undefined

  const firstName = (user?.name ?? 'Farmer').split(' ')[0]

  const totalTreesRegistered = profile?.farms?.reduce((acc, f) => acc + (f.treeCount || 0), 0) || 1374
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length
  const verifiedReportsCount = reports.filter((r) => r.status === 'verified').length
  const recoveredCount = Math.max(0, reports.length - pendingReportsCount - verifiedReportsCount)

  const treatingPalms = pendingReportsCount > 0 ? pendingReportsCount * 8 : 96
  const atRiskPalms = diseaseAlerts.length > 0 ? diseaseAlerts.length * 6 : 38
  const healthyPalms = Math.max(100, totalTreesRegistered - treatingPalms - atRiskPalms)
  const healthScore = totalTreesRegistered > 0
    ? ((healthyPalms / totalTreesRegistered) * 100).toFixed(1)
    : '87.4'

  const totalPalms = totalTreesRegistered || 1374
  const healthyPercent = Math.min(100, Math.round((healthyPalms / totalPalms) * 100))
  const treatingPercent = Math.min(100, Math.round((treatingPalms / totalPalms) * 100))
  const atRiskPercent = Math.min(100, Math.round((atRiskPalms / totalPalms) * 100))

  const upcomingRainDay = weather?.days?.find((d) => (d.rainChance ?? d.rain ?? 0) >= 40)
  const rainText = upcomingRainDay
    ? upcomingRainDay.day === 'Today'
      ? 'today'
      : `in ${upcomingRainDay.day}`
    : 'low today'
  const isRiskHigh = diseaseAlerts.some((a) => a.severity === 'high' || !a.read)
  const riskLabel = isRiskHigh ? 'Moderate' : 'Low today'
  const riskColor = isRiskHigh ? 'text-[#8A5A00]' : 'text-[#1E7A44]'

  const currentDateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).toUpperCase()

  return (
    <div>
      <div className="lg:hidden space-y-4 pb-8">
        <div className="space-y-1">
          <div className="text-[12px] font-bold text-[#8A9A8E] tracking-wider uppercase">
            {currentDateStr}
          </div>
          <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[26px] font-extrabold text-[#123524] tracking-tight leading-tight flex items-center gap-2">
            {greeting}, {firstName} <span className="text-[24px]">👋</span>
          </h1>
          <p className="text-[13.5px] text-[#5C6B60] leading-snug">
            Your farm is looking healthy today — here's the latest overview.
          </p>
        </div>

        <MobileWeatherHero
          farms={farms}
          selectedFarmId={selectedFarm?.id}
          onSelectFarm={handleSelectFarm}
          weather={weather}
          loading={weatherLoading}
        />

        <MobileTwinStats healthScore={healthScore} unreadAlertCount={unreadAlertCount} />

        <MobileQuickActions />

        <MobileRecentDetections reports={reports} />

        <MobileTipOfDay />
      </div>

      <div className="hidden lg:block space-y-6">
        <div>
          <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-xl font-bold tracking-tight text-[#10241A] sm:text-2xl lg:text-3xl">
            {greeting}, {firstName}!
          </h1>
          <p className="mt-0.5 text-[11px] text-[#5C6B60] sm:text-xs lg:text-sm">
            Composite palm health, nearby outbreak surveillance, and microclimate advisory.
          </p>
        </div>

        <DesktopStatsCards
          healthScore={healthScore}
          healthyPercent={healthyPercent}
          healthyPalms={healthyPalms}
          treatingPercent={treatingPercent}
          treatingPalms={treatingPalms}
          atRiskPercent={atRiskPercent}
          atRiskPalms={atRiskPalms}
          reportsCount={reports.length}
          verifiedReportsCount={verifiedReportsCount}
          pendingReportsCount={pendingReportsCount}
          recoveredCount={recoveredCount}
          weatherLocation={weather?.location ?? selectedFarm?.name ?? farmRegion}
          currentTemp={weather?.current?.temp ?? 0}
          weatherDescription={weather?.current?.description ?? (weatherLoading ? 'Loading forecast' : 'unavailable')}
          weatherHumidity={weather?.current?.humidity ?? 0}
          rainText={rainText}
          riskLabel={riskLabel}
          riskColor={riskColor}
        />

        <DesktopQuickActions totalFarmsCount={totalFarmsCount} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <DesktopRecentDiagnoses reports={reports} />
          <DesktopDiseaseAlerts
            diseaseAlerts={diseaseAlerts}
            heatmap={heatmap}
            unreadAlertCount={unreadAlertCount}
          />
        </div>

        <DesktopWeatherForecast
          weather={weather}
          farmRegion={farmRegion}
          farms={farms}
          selectedFarmId={selectedFarm?.id}
          onSelectFarm={handleSelectFarm}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
          weatherErrorMessage={weatherErrorMessage}
        />
      </div>
    </div>
  )
}
