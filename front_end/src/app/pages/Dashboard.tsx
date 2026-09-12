import { Link } from 'react-router'
import {
  Microscope,
  MessageSquare,
  Map,
  Bell,
  CloudRain,
  CloudSun,
  Droplets,
  Sun,
  Wind,
  Cloud,
  Loader2,
  Thermometer,
  Gauge,
  Eye,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { farmApi, reportsApi, diseaseMapApi, weatherApi } from '@/api/services'
import type { DiseaseReport, WeatherDay, WeatherForecast, WeatherIcon } from '@/types'

export function Dashboard() {
  const { user } = useAuth()

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

  const quickLinks = [
    { label: 'Coconut Disease Diagnosis', href: '/app/disease-detection', icon: Microscope, color: 'from-green-500 to-[#2d5f2e]' },
    { label: 'AI Chatbot', href: '/app/chatbot', icon: MessageSquare, color: 'from-emerald-500 to-teal-600' },
    { label: 'Heatmap', href: '/app/heatmap', icon: Map, color: 'from-blue-500 to-cyan-600' },
    { label: 'Notifications', href: '/app/notifications', icon: Bell, color: 'from-amber-500 to-orange-500' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="mb-1 text-2xl text-[#1a2e1a] sm:mb-2 sm:text-3xl">Welcome, {firstName}!</h1>
        <p className="mb-4 text-sm text-[#6b7c6b] sm:mb-6 sm:text-base">
          Quick access to your plantation tools.
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="group flex min-h-[6.5rem] flex-col items-center gap-2 rounded-2xl border border-green-100 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md sm:min-h-0 sm:gap-3 sm:p-5"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${link.color} text-white shadow-sm transition-transform duration-200 group-hover:scale-110 sm:h-12 sm:w-12`}
              >
                <link.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="text-center text-xs font-medium leading-snug text-gray-800 sm:text-sm">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Row 1: Recent AI Diagnoses + Disease Alerts */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <RecentDiagnosesSection reports={reports} compact />
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-2">
            <h2 className="text-lg text-[#1a2e1a] sm:text-xl">Current Disease Alerts</h2>
            {unreadAlertCount > 0 && (
              <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                {unreadAlertCount} unread
              </span>
            )}
          </div>
          <div className="space-y-3">
            {diseaseAlerts.length === 0 && heatmap.length === 0 ? (
              <p className="text-sm text-gray-500">No outbreak data available.</p>
            ) : diseaseAlerts.length > 0 ? (
              diseaseAlerts.slice(0, 4).map((alert) => (
                <AlertItem
                  key={alert.id}
                  disease={alert.diseaseType}
                  location={`${alert.distanceKm} km away`}
                  severity={alert.read ? 'low' : 'high'}
                />
              ))
            ) : (
              heatmap.slice(0, 4).map((point, i) => (
                <AlertItem
                  key={i}
                  disease={point.diseaseType}
                  location={`${point.lat.toFixed(2)}, ${point.lng.toFixed(2)}`}
                  severity={point.weight >= 0.8 ? 'high' : point.weight >= 0.6 ? 'medium' : 'low'}
                />
              ))
            )}
          </div>
          <Link to="/app/heatmap" className="inline-block mt-4 text-sm text-[#2d5f2e] hover:underline">
            View full heatmap
          </Link>
        </div>
      </div>

      <WeatherForecastCard
        region={farmRegion}
        weather={weather}
        loading={weatherLoading}
        error={weatherError}
        errorMessage={weatherErrorMessage}
      />
    </div>
  )
}

function RecentDiagnosesSection({ reports, compact }: { reports: DiseaseReport[]; compact?: boolean }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg text-[#1a2e1a] sm:text-xl">Recent AI Diagnoses</h2>
        <Link
          to="/app/disease-detection"
          className="shrink-0 text-sm text-[#2d5f2e] hover:underline"
        >
          New diagnosis
        </Link>
      </div>
      {reports.length === 0 ? (
        <p className="text-sm text-gray-500">No reports yet. Run a diagnosis to see results.</p>
      ) : (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
          {reports.slice(0, compact ? 4 : 6).map((r) => (
            <DiagnosisItem key={r.id} report={r} compact={compact} />
          ))}
        </div>
      )}
    </>
  )
}

function WeatherIconDisplay({ icon, className }: { icon: WeatherIcon; className?: string }) {
  const cls = className ?? 'w-7 h-7'
  if (icon === 'sun') return <Sun className={`${cls} text-amber-500`} />
  if (icon === 'rain') return <CloudRain className={`${cls} text-blue-600`} />
  if (icon === 'cloud') return <Cloud className={`${cls} text-gray-500`} />
  return <CloudSun className={`${cls} text-blue-400`} />
}

function WeatherForecastCard({
  region,
  weather,
  loading,
  error,
  errorMessage,
}: {
  region: string
  weather?: WeatherForecast
  loading: boolean
  error: boolean
  errorMessage?: string
}) {
  const displayRegion = weather?.location ?? region

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg text-[#1a2e1a] sm:text-xl">Weather Forecast</h2>
          <p className="text-sm text-gray-500">
            {displayRegion}, Sri Lanka · 5–6 day outlook
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
        </div>
      ) : error || !weather ? (
        <div className="text-sm text-gray-500 py-8 text-center space-y-2">
          <p>Weather data unavailable.</p>
          {errorMessage && (
            <p className="text-xs text-red-600 max-w-md mx-auto">{errorMessage}</p>
          )}
          <p className="text-xs">
            Ensure the backend is running and a valid{' '}
            <code className="text-gray-700">OPENWEATHER_API_KEY</code> is set in{' '}
            <code className="text-gray-700">backend/.env</code>.
          </p>
        </div>
      ) : (
        <>
          {/* Current conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-4 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <WeatherIconDisplay icon={weather.current.icon} className="w-14 h-14 shrink-0" />
                <div>
                  <div className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                    {weather.current.temp}°C
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {weather.current.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Feels like {weather.current.feelsLike}°C
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <DetailChip
                  icon={<Thermometer className="w-3.5 h-3.5 text-orange-500" />}
                  label="Temperature"
                  value={`${weather.current.temp}°C`}
                />
                <DetailChip
                  icon={<Droplets className="w-3.5 h-3.5 text-blue-500" />}
                  label="Humidity"
                  value={`${weather.current.humidity}%`}
                />
                <DetailChip
                  icon={<Wind className="w-3.5 h-3.5 text-sky-600" />}
                  label="Wind"
                  value={`${weather.current.windSpeed} km/h ${weather.current.windDirection}`}
                />
                <DetailChip
                  icon={<CloudRain className="w-3.5 h-3.5 text-blue-600" />}
                  label="Rain chance"
                  value={`${weather.current.rainChance ?? 0}%`}
                />
                <DetailChip
                  icon={<Gauge className="w-3.5 h-3.5 text-gray-500" />}
                  label="Pressure"
                  value={`${weather.current.pressure} hPa`}
                />
                <DetailChip
                  icon={<Eye className="w-3.5 h-3.5 text-gray-500" />}
                  label="Visibility"
                  value={
                    weather.current.visibilityKm != null
                      ? `${weather.current.visibilityKm} km`
                      : '—'
                  }
                />
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {weather.days.map((day) => (
                <ForecastDay key={`${day.day}-${day.date ?? day.high}`} day={day} />
              ))}
            </div>
          </div>

          {weather.farmingTip && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-950">
              <span className="font-medium">Farming tip: </span>
              {weather.farmingTip}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function DetailChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-white/70 border border-blue-100/80 px-2.5 py-2">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
        <div className="font-medium text-gray-900 truncate">{value}</div>
      </div>
    </div>
  )
}

function ForecastDay({ day }: { day: WeatherDay }) {
  const rainChance = day.rainChance ?? day.rain ?? 0
  const rainMm = day.rainMm ?? 0
  const humidity = day.humidity ?? 0
  const windSpeed = day.windSpeed ?? 0
  const windDirection = day.windDirection ?? '—'
  const feelsLike = day.feelsLike ?? Math.round((day.high + day.low) / 2)

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-100 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{day.day}</div>
          <div className="text-xs text-gray-500 capitalize">{day.description ?? '—'}</div>
        </div>
        <WeatherIconDisplay icon={day.icon} className="w-8 h-8" />
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-semibold text-gray-900">{day.high}°</span>
        <span className="text-sm text-gray-500">{day.low}° low</span>
      </div>

      <div className="space-y-1.5 text-xs text-gray-700">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-gray-500">
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            Feels like
          </span>
          <span className="font-medium">{feelsLike}°C</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-gray-500">
            <CloudRain className="w-3.5 h-3.5 text-blue-600" />
            Rain
          </span>
          <span className="font-medium text-blue-700">
            {rainChance}%
            {rainMm > 0 ? ` · ${rainMm} mm` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-gray-500">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            Humidity
          </span>
          <span className="font-medium">{humidity}%</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-gray-500">
            <Wind className="w-3.5 h-3.5 text-sky-600" />
            Wind
          </span>
          <span className="font-medium">
            {windSpeed} km/h {windDirection}
          </span>
        </div>
      </div>
    </div>
  )
}

function AlertItem({ disease, location, severity }: { disease: string; location: string; severity: string }) {
  const colors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  }
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="text-gray-900 text-sm">{disease}</div>
        <div className="text-xs text-gray-500">{location}</div>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${colors[severity as keyof typeof colors]}`}>{severity}</span>
    </div>
  )
}

function DiagnosisItem({ report, compact }: { report: DiseaseReport; compact?: boolean }) {
  const disease = report.finalResult ?? report.imageResult ?? 'Unknown'
  const confidence = Math.round(report.confidence * 100)
  const date = new Date(report.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const statusStyles = {
    verified: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <div className={`p-4 bg-gray-50 rounded-xl border border-gray-100 h-full flex flex-col ${compact ? 'text-sm' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">{date}</div>
          <div className="text-sm font-medium text-gray-800 truncate">{report.farmName}</div>
          {!compact && <div className="text-xs text-gray-500">{report.region}</div>}
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs border capitalize ${statusStyles[report.status]}`}>
          {report.status}
        </span>
      </div>

      <div className={`font-semibold text-[#1a2e1a] mb-2 ${compact ? 'text-sm' : 'text-base'}`}>{disease}</div>

      {!compact && (report.imageResult || report.symptomResult) && (
        <div className="text-xs text-gray-600 space-y-1 mb-3">
          {report.imageResult && (
            <div>
              <span className="text-gray-400">Image: </span>
              {report.imageResult}
            </div>
          )}
          {report.symptomResult && (
            <div>
              <span className="text-gray-400">Symptoms: </span>
              {report.symptomResult}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Confidence</span>
          <span className="text-sm font-medium text-green-600">{confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${confidence}%` }} />
        </div>
      </div>
    </div>
  )
}
