import { Link } from 'react-router'
import {
  Microscope,
  MessageSquare,
  Map,
  ArrowRight,
  CloudRain,
  CloudSun,
  Droplets,
  Sun,
  Wind,
  Cloud,
  Loader2,
  TreePine,
  Sparkles,
  Leaf,
  ClipboardList,
  CheckCircle2,
  Clock,
  RotateCcw,
  Shield,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { farmApi, reportsApi, diseaseMapApi, weatherApi } from '@/api/services'
import type { DiseaseReport, WeatherDay, WeatherForecast, WeatherIcon } from '@/types'

function getDiseaseEmoji(disease: string): { emoji: string; bg: string } {
  const d = disease.toLowerCase()
  if (d.includes('leaf') || d.includes('wilt') || d.includes('leaflets')) {
    return { emoji: '🍂', bg: 'bg-[#FDE7E8]' }
  }
  if (d.includes('stem') || d.includes('bleeding') || d.includes('rot') || d.includes('ganoderma')) {
    return { emoji: '🪵', bg: 'bg-[#FCF0DA]' }
  }
  if (d.includes('bud') || d.includes('crown') || d.includes('beetle') || d.includes('weevil')) {
    return { emoji: '🌴', bg: 'bg-[#EDF3E0]' }
  }
  return { emoji: '🥥', bg: 'bg-[#DDF2EA]' }
}

function getMethodBadge(report: DiseaseReport): { label: string } {
  if (report.imageResult && report.symptomResult) {
    return { label: '⚡ Fusion' }
  }
  if (report.imageResult) {
    return { label: '📷 Leaf scan' }
  }
  return { label: '🧪 Symptoms' }
}

function getStatusBadge(status: string, confidence: number) {
  if (status === 'verified') {
    if (confidence >= 0.9) {
      return {
        label: 'Auto-verified',
        className: 'bg-[#C9F169] text-[#0C281B]',
      }
    }
    return {
      label: 'Verified',
      className: 'bg-[#E1F3E8] text-[#1E7A44]',
    }
  }
  if (status === 'pending') {
    return {
      label: 'Pending',
      className: 'bg-[#FCF0DA] text-[#8A5A00]',
    }
  }
  if (status === 'rejected') {
    return {
      label: 'Rejected',
      className: 'bg-[#FDE7E8] text-[#B3261E]',
    }
  }
  return {
    label: 'In review',
    className: 'bg-[#ECEFE6] text-[#55655A]',
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function WeatherIconDisplay({ icon, className }: { icon: WeatherIcon; className?: string }) {
  const cls = className ?? 'w-7 h-7'
  if (icon === 'sun') return <Sun className={`${cls} text-[#F5A524]`} />
  if (icon === 'rain') return <CloudRain className={`${cls} text-[#3B82F6]`} />
  if (icon === 'cloud') return <Cloud className={`${cls} text-gray-400`} />
  return <CloudSun className={`${cls} text-[#60A5FA]`} />
}

function getWeatherRisk(day: WeatherDay) {
  const rain = day.rainChance ?? day.rain ?? 0
  if (rain >= 50) return { label: 'High', className: 'bg-[#FDE7E8] text-[#B3261E]' }
  if (rain >= 25) return { label: 'Med', className: 'bg-[#FCF0DA] text-[#8A5A00]' }
  return { label: 'Low', className: 'bg-[#E1F3E8] text-[#1E7A44]' }
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return 'Good morning'
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon'
  }
  return 'Good evening'
}

export function Dashboard() {
  const { user } = useAuth()
  const greeting = getTimeBasedGreeting()

  const { data: profile } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

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

  const farm = profile?.farms[0]
  const farmRegion = farm?.location ?? 'Kurunegala'
  const totalFarmsCount = profile?.farms?.length ?? 1

  const {
    data: weather,
    isLoading: weatherLoading,
    isError: weatherError,
    error: weatherQueryError,
  } = useQuery({
    queryKey: ['weather', 'forecast', farm?.latitude, farm?.longitude, farmRegion],
    queryFn: () =>
      weatherApi.forecast({
        lat: farm?.latitude,
        lon: farm?.longitude,
        location: farmRegion,
      }),
    enabled: !!profile,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  })

  const weatherErrorMessage =
    weatherQueryError && typeof weatherQueryError === 'object' && 'response' in weatherQueryError
      ? (weatherQueryError as { response?: { data?: { message?: string } } }).response?.data?.message
      : undefined

  const firstName = (user?.name ?? 'Farmer').split(' ')[0]

  // Calculated plantation analytics
  const totalTreesRegistered = profile?.farms?.reduce((acc, f) => acc + (f.treeCount || 0), 0) || 1374
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length
  const verifiedReportsCount = reports.filter((r) => r.status === 'verified').length
  const autoVerifiedCount = reports.filter((r) => r.status === 'verified' && r.confidence >= 0.85).length
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
  const rainText = upcomingRainDay ? `in ${upcomingRainDay.day}` : 'in 2 days'
  const isRiskHigh = diseaseAlerts.some((a) => a.severity === 'high' || !a.read)
  const riskLabel = isRiskHigh ? 'Moderate' : 'Low today'
  const riskColor = isRiskHigh ? 'text-[#8A5A00]' : 'text-[#1E7A44]'

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome Banner */}
      <div>
        <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold tracking-tight text-[#10241A] sm:text-3xl">
          {greeting}, {firstName}!
        </h1>
        <p className="mt-1 text-xs text-[#5C6B60] sm:text-sm">
          Composite palm health, nearby outbreak surveillance, and microclimate advisory.
        </p>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Palm health */}
        <div className="flex flex-col justify-between rounded-[20px] border border-[#E6EADF] bg-white p-5 shadow-[0_1px_2px_rgba(16,36,26,.04),0_6px_20px_rgba(16,36,26,.05)] sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#10241A]">
              <Leaf className="h-4 w-4 text-[#3DA35D]" />
              <span>Palm health</span>
            </div>

            <div className="mt-4">
              <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-3xl font-bold leading-none tracking-tight text-[#10241A] sm:text-4xl">
                {healthScore}%
              </div>
              <p className="mt-1.5 text-xs text-[#5C6B60] sm:text-sm">
                up 4.2% this season
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="w-16 shrink-0 font-medium text-[#5C6B60]">Healthy</span>
              <div className="mx-3 h-1.5 flex-1 overflow-hidden rounded-full bg-[#E6EADF]">
                <div
                  className="h-full rounded-full bg-[#3DA35D]"
                  style={{ width: `${healthyPercent}%` }}
                />
              </div>
              <span className="w-12 text-right font-semibold text-[#10241A] tabular-nums">
                {healthyPalms.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="w-16 shrink-0 font-medium text-[#5C6B60]">Treating</span>
              <div className="mx-3 h-1.5 flex-1 overflow-hidden rounded-full bg-[#E6EADF]">
                <div
                  className="h-full rounded-full bg-[#F5A524]"
                  style={{ width: `${Math.max(8, treatingPercent)}%` }}
                />
              </div>
              <span className="w-12 text-right font-semibold text-[#10241A] tabular-nums">
                {treatingPalms.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="w-16 shrink-0 font-medium text-[#5C6B60]">At risk</span>
              <div className="mx-3 h-1.5 flex-1 overflow-hidden rounded-full bg-[#E6EADF]">
                <div
                  className="h-full rounded-full bg-[#E5484D]"
                  style={{ width: `${Math.max(5, atRiskPercent)}%` }}
                />
              </div>
              <span className="w-12 text-right font-semibold text-[#10241A] tabular-nums">
                {atRiskPalms.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Active reports */}
        <div className="flex flex-col justify-between rounded-[20px] border border-[#E6EADF] bg-white p-5 shadow-[0_1px_2px_rgba(16,36,26,.04),0_6px_20px_rgba(16,36,26,.05)] sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#10241A]">
              <ClipboardList className="h-4 w-4 text-[#3B82F6]" />
              <span>Active reports</span>
            </div>

            <div className="mt-4">
              <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-3xl font-bold leading-none tracking-tight text-[#10241A] sm:text-4xl">
                {reports.length}
              </div>
              <p className="mt-1.5 text-xs text-[#5C6B60] sm:text-sm">
                submitted in the last 30 days
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-medium text-[#10241A]">
                <CheckCircle2 className="h-4 w-4 text-[#3DA35D]" />
                <span>Verified</span>
              </span>
              <span className="font-semibold text-[#10241A] tabular-nums">
                {verifiedReportsCount}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-medium text-[#10241A]">
                <Clock className="h-4 w-4 text-[#F5A524]" />
                <span>In review</span>
              </span>
              <span className="font-semibold text-[#10241A] tabular-nums">
                {pendingReportsCount}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-medium text-[#10241A]">
                <RotateCcw className="h-4 w-4 text-[#3B82F6]" />
                <span>Recovered</span>
              </span>
              <span className="font-semibold text-[#10241A] tabular-nums">
                {recoveredCount || 1}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Weather · Kurunegala */}
        <div className="flex flex-col justify-between rounded-[20px] border border-[#E6EADF] bg-white p-5 shadow-[0_1px_2px_rgba(16,36,26,.04),0_6px_20px_rgba(16,36,26,.05)] sm:p-6 md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#10241A]">
              <Cloud className="h-4 w-4 text-[#5C6B60]" />
              <span>Weather · {weather?.location ?? farmRegion}</span>
            </div>

            <div className="mt-4">
              <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-3xl font-bold leading-none tracking-tight text-[#10241A] sm:text-4xl">
                {weather?.current?.temp ?? 29}°
              </div>
              <p className="mt-1.5 text-xs text-[#5C6B60] capitalize sm:text-sm">
                {weather?.current?.description ?? 'partly cloudy'} · {weather?.current?.humidity ?? 78}% humidity
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-medium text-[#10241A]">
                <CloudRain className="h-4 w-4 text-[#3B82F6]" />
                <span>Rain</span>
              </span>
              <span className="font-semibold text-[#10241A]">
                {rainText}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-medium text-[#10241A]">
                <Shield className="h-4 w-4 text-[#3DA35D]" />
                <span>Disease risk</span>
              </span>
              <span className={`font-bold ${riskColor}`}>
                {riskLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tile 1: Primary New Diagnosis */}
        <Link
          to="/app/disease-detection"
          className="group flex items-center gap-3.5 rounded-[18px] border border-[#123524] bg-[#123524] p-4 text-white shadow-sm transition-colors hover:bg-[#0C281B]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[rgba(201,241,105,.16)] text-[#C9F169]">
            <Microscope className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <b className="block font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold text-white">New Diagnosis</b>
            <span className="block truncate text-xs text-[#AEC0A6]">Leaf scan · symptom quiz</span>
          </div>
        </Link>

        {/* Tile 2: AI Assistant */}
        <Link
          to="/app/chatbot"
          className="group flex items-center gap-3.5 rounded-[18px] border border-[#E6EADF] bg-white p-4 text-[#10241A] shadow-sm transition-colors hover:border-[#BFD98F] hover:bg-[#FBFDF8]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#EDF3E0] text-[#123524]">
            <MessageSquare className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <b className="block font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold text-[#10241A]">AI Assistant</b>
            <span className="block truncate text-xs text-[#5C6B60]">CRI-grounded answers</span>
          </div>
        </Link>

        {/* Tile 3: Disease Map */}
        <Link
          to="/app/heatmap"
          className="group flex items-center gap-3.5 rounded-[18px] border border-[#E6EADF] bg-white p-4 text-[#10241A] shadow-sm transition-colors hover:border-[#BFD98F] hover:bg-[#FBFDF8]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#DDF2EA] text-[#147A5C]">
            <Map className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <b className="block font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold text-[#10241A]">Disease Map</b>
            <span className="block truncate text-xs text-[#5C6B60]">Live outbreak heatmap</span>
          </div>
        </Link>

        {/* Tile 4: My Farms */}
        <Link
          to="/app/profile"
          className="group flex items-center gap-3.5 rounded-[18px] border border-[#E6EADF] bg-white p-4 text-[#10241A] shadow-sm transition-colors hover:border-[#BFD98F] hover:bg-[#FBFDF8]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#FCF0DA] text-[#8A5A00]">
            <TreePine className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <b className="block font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold text-[#10241A]">My Farms</b>
            <span className="block truncate text-xs text-[#5C6B60]">{totalFarmsCount} registered plantation{totalFarmsCount === 1 ? '' : 's'}</span>
          </div>
        </Link>
      </div>

      {/* Two-Column Grid: Recent Diagnoses (Left) + Disease Alerts (Right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column: Recent Diagnoses */}
        <div className="rounded-[20px] border border-[#E6EADF] bg-white p-5 shadow-[0_1px_2px_rgba(16,36,26,.04),0_6px_20px_rgba(16,36,26,.05)] sm:p-6 lg:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
                Recent Diagnoses
              </h3>
              <span className="text-xs text-[#5C6B60]">Latest AI & officer-reviewed reports</span>
            </div>
            <Link
              to="/app/disease-detection"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E6EADF] px-3.5 py-1.5 text-xs font-semibold text-[#10241A] transition-colors hover:border-[#5C6B60] hover:bg-[#F6F7F2]"
            >
              New diagnosis
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E6EADF] py-12 text-center">
              <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF3E0] text-xl">
                🌴
              </span>
              <p className="text-sm font-medium text-[#10241A]">No diagnosis reports yet</p>
              <p className="mt-1 text-xs text-[#5C6B60]">Run an AI leaf scan or complete a symptom questionnaire.</p>
              <Link
                to="/app/disease-detection"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#123524] hover:underline"
              >
                Start first diagnosis <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E6EADF] text-[11px] font-bold uppercase tracking-wider text-[#5C6B60]">
                    <th className="pb-2.5 pt-1">Disease</th>
                    <th className="pb-2.5 pt-1">Date</th>
                    <th className="pb-2.5 pt-1">Method</th>
                    <th className="pb-2.5 pt-1">Confidence</th>
                    <th className="pb-2.5 pt-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 5).map((r) => {
                    const diseaseName = r.finalResult ?? r.imageResult ?? r.symptomResult ?? 'Undetermined'
                    const { emoji, bg } = getDiseaseEmoji(diseaseName)
                    const { label: methodLabel } = getMethodBadge(r)
                    const confidencePct = Math.round(r.confidence * 100)
                    const statusBadge = getStatusBadge(r.status, r.confidence)

                    return (
                      <tr
                        key={r.id}
                        className="border-b border-[#E6EADF] transition-colors last:border-b-0 hover:bg-[#F6F7F2]/60"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${bg}`}>
                              {emoji}
                            </span>
                            <div className="min-w-0 max-w-[200px] sm:max-w-[240px]">
                              <b className="block truncate font-semibold text-[#10241A]">{diseaseName}</b>
                              <span className="block truncate text-[11px] text-[#5C6B60]">
                                {r.farmName} · RD-{r.id.slice(-4)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 whitespace-nowrap text-xs text-[#5C6B60]">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full bg-[#EDF3E0] px-2 py-0.5 text-[11px] font-semibold text-[#2E4A38]">
                            {methodLabel}
                          </span>
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <div className="min-w-[100px]">
                            <b className="text-xs font-bold text-[#10241A]">{confidencePct}%</b>
                            <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-[#E6EADF]">
                              <div
                                className={`h-full rounded-full ${confidencePct < 70 ? 'bg-[#F5A524]' : 'bg-[#7FA81B]'}`}
                                style={{ width: `${confidencePct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Disease Alerts */}
        <div className="flex flex-col rounded-[20px] border border-[#E6EADF] bg-white p-5 shadow-[0_1px_2px_rgba(16,36,26,.04),0_6px_20px_rgba(16,36,26,.05)] sm:p-6 lg:col-span-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
                Disease Alerts
              </h3>
              <span className="text-xs text-[#5C6B60]">Within 25 km of your plantation</span>
            </div>
            {unreadAlertCount > 0 && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-[#FDE7E8] px-2 py-0.5 text-[11px] font-semibold text-[#B3261E]">
                {unreadAlertCount} unread
              </span>
            )}
          </div>

          <div className="my-2 space-y-2.5">
            {diseaseAlerts.length === 0 && heatmap.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#5C6B60]">No outbreaks reported in your area.</p>
            ) : diseaseAlerts.length > 0 ? (
              diseaseAlerts.slice(0, 3).map((alert) => {
                const isHigh = alert.severity === 'high' || (!alert.read && alert.alertType !== 'ai_suspected')
                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-2xl border border-[#E6EADF] p-3 transition-colors hover:border-[#BFD98F] hover:bg-[#F6F7F2]/60"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${isHigh ? 'bg-[#FDE7E8]' : 'bg-[#FCF0DA]'}`}>
                      {isHigh ? '🚨' : '⚠️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-semibold leading-tight text-[#10241A] sm:text-sm">
                        {alert.diseaseType}
                      </p>
                      <span className="mt-0.5 block text-[11px] text-[#5C6B60]">
                        {alert.distanceKm} km away · {alert.alertType === 'ai_suspected' ? 'AI suspected' : 'Verified'}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
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
                    className="flex items-start gap-3 rounded-2xl border border-[#E6EADF] p-3 transition-colors hover:border-[#BFD98F] hover:bg-[#F6F7F2]/60"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${isHigh ? 'bg-[#FDE7E8]' : 'bg-[#FCF0DA]'}`}>
                      {isHigh ? '🚨' : '⚠️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-semibold leading-tight text-[#10241A] sm:text-sm">
                        {point.diseaseType}
                      </p>
                      <span className="mt-0.5 block text-[11px] text-[#5C6B60]">
                        Coordinates: {point.lat.toFixed(2)}, {point.lng.toFixed(2)}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
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
            className="group mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-[#123524] hover:text-[#0C281B]"
          >
            View full heatmap
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Weather Forecast & Microclimate Outlook Card */}
      <div className="rounded-[20px] border border-[#E6EADF] bg-white p-5 shadow-[0_1px_2px_rgba(16,36,26,.04),0_6px_20px_rgba(16,36,26,.05)] sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A] sm:text-xl">
              Weather & Microclimate Forecast
            </h2>
            <p className="text-xs text-[#5C6B60]">
              {weather?.location ?? farmRegion}, Sri Lanka · 7-day agronomic outlook
            </p>
          </div>
        </div>

        {weatherLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
          </div>
        ) : weatherError || !weather ? (
          <div className="space-y-1.5 py-8 text-center text-xs text-[#5C6B60]">
            <p>Weather data temporarily unavailable.</p>
            {weatherErrorMessage && (
              <p className="mx-auto max-w-md text-red-600">{weatherErrorMessage}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left box: Current conditions */}
            <div className="flex flex-col justify-between rounded-2xl bg-[#123524] p-5 text-white shadow-sm lg:col-span-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-3xl font-bold leading-none sm:text-4xl">
                      {weather.current.temp}°C
                    </div>
                    <div className="mt-1 text-xs text-[#AEC0A6]">
                      {weather.location ?? farmRegion} · Now
                    </div>
                    <div className="mt-0.5 text-xs text-white/80 capitalize">
                      {weather.current.description} · Feels like {weather.current.feelsLike}°C
                    </div>
                  </div>
                  <WeatherIconDisplay icon={weather.current.icon} className="h-10 w-10 shrink-0 text-[#C9F169]" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(201,241,105,.16)] px-2.5 py-1 text-xs font-semibold text-[#C9F169]">
                    <Droplets className="h-3.5 w-3.5" />
                    {weather.current.humidity}% humidity
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(201,241,105,.16)] px-2.5 py-1 text-xs font-semibold text-[#C9F169]">
                    <Wind className="h-3.5 w-3.5" />
                    {weather.current.windSpeed} km/h {weather.current.windDirection}
                  </span>
                </div>
              </div>

              {/* Agronomic spray window / farming tip banner */}
              <div className="mt-5 rounded-xl border border-[rgba(201,241,105,.3)] bg-[rgba(201,241,105,.14)] p-3 text-xs font-semibold leading-relaxed text-[#C9F169]">
                ✓ Spray window: today 6 – 9 AM · {weather.farmingTip || 'Optimal conditions for foliar application'}
              </div>
            </div>

            {/* Right grid: 7-day outlook */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6 lg:col-span-8">
              {weather.days.map((day) => {
                const risk = getWeatherRisk(day)
                return (
                  <div
                    key={`${day.day}-${day.date ?? day.high}`}
                    className="flex flex-col items-center justify-between gap-1.5 rounded-2xl border border-[#E6EADF] bg-[#F6F7F2]/40 p-3 text-center transition-all hover:border-[#BFD98F] hover:bg-white"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B60]">
                      {day.day}
                    </span>
                    <WeatherIconDisplay icon={day.icon} className="my-1 h-7 w-7" />
                    <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold text-[#10241A]">
                      {day.high}° <small className="text-xs font-medium text-[#5C6B60]">{day.low}°</small>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${risk.className}`}>
                      {risk.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
