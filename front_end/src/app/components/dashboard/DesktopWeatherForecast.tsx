import type { ReactNode } from 'react'
import {
  Loader2,
  Droplets,
  Wind,
  CloudRain,
  Leaf,
  Gauge,
  Eye,
} from 'lucide-react'
import { motion } from 'motion/react'
import type { Farm, WeatherForecast } from '@/types'
import { WeatherIconDisplay, getWeatherRisk } from './dashboardUtils'
import { FarmWeatherSelect } from './FarmWeatherSelect'
import { WeatherPeriodCards } from './WeatherPeriodCards'

interface DesktopWeatherForecastProps {
  weather?: WeatherForecast
  farmRegion: string
  farms: Farm[]
  selectedFarmId?: string
  onSelectFarm: (farmId: string) => void
  weatherLoading: boolean
  weatherError: boolean
  weatherErrorMessage?: string
}

export function DesktopWeatherForecast({
  weather,
  farmRegion,
  farms,
  selectedFarmId,
  onSelectFarm,
  weatherLoading,
  weatherError,
  weatherErrorMessage,
}: DesktopWeatherForecastProps) {
  const dayCount = weather?.days.length ?? 5
  const today = weather?.days[0]
  const todayRain = today?.rainChance ?? weather?.current.rainChance ?? 0
  const todayRainMm = today?.rainMm ?? 0
  const heaviest = weather?.days.reduce(
    (best, day) => ((day.rainChance ?? 0) > (best.rainChance ?? 0) ? day : best),
    weather?.days[0],
  )

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#D8E4D0] bg-white shadow-[0_1px_2px_rgba(16,36,26,.04),0_8px_24px_rgba(16,36,26,.06)]">
      <div className="flex flex-col gap-3 border-b border-[#D8E4D0] bg-gradient-to-r from-[#F3F8EC] to-[#EEF6FF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A] lg:text-xl">
              Weather & Microclimate Forecast
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2F80ED]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1D5BB8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2F80ED]" />
              Live
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-[#5C6B60]">
            {weather?.location ?? farmRegion}, Sri Lanka · {dayCount}-day spray-window outlook
            {heaviest ? ` · heaviest rain ${heaviest.day} (${heaviest.rainChance}%)` : ''}
          </p>
        </div>
        <FarmWeatherSelect
          farms={farms}
          selectedFarmId={selectedFarmId}
          onChange={onSelectFarm}
        />
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        {weatherLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
          </div>
        ) : weatherError || !weather ? (
          <div className="space-y-1.5 rounded-2xl border border-dashed border-[#D8E4D0] bg-[#F3F8EC]/50 py-10 text-center text-xs text-[#5C6B60]">
            <p>Weather data temporarily unavailable.</p>
            {weatherErrorMessage && (
              <p className="mx-auto max-w-md text-red-600">{weatherErrorMessage}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0E3A2F] via-[#164A38] to-[#1D4E6B] p-5 text-white lg:col-span-4"
            >
              <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#7EC8E3]/25 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 left-6 h-36 w-36 rounded-full bg-[#C9F169]/18 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8E0F0]">
                    Now at the estate
                  </p>
                  <div className="mt-2 font-['Bricolage_Grotesque',Inter,sans-serif] text-5xl font-bold leading-none tracking-tight">
                    {weather.current.temp}°
                    <span className="text-2xl font-semibold text-white/70">C</span>
                  </div>
                  <p className="mt-2 text-sm capitalize text-white/90">
                    {weather.current.description}
                  </p>
                  <p className="mt-0.5 text-xs text-[#C7E4DA]">
                    Feels like {weather.current.feelsLike}°C
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7EC8E3]/20 backdrop-blur-md">
                  <WeatherIconDisplay
                    icon={weather.current.icon}
                    className="h-8 w-8 text-[#E8F6FF]"
                  />
                </div>
              </div>

              <div className="relative mt-5 grid grid-cols-2 gap-2">
                <MetricChip
                  icon={<Droplets className="h-3.5 w-3.5" />}
                  value={`${weather.current.humidity}%`}
                  label="Humidity"
                />
                <MetricChip
                  icon={<Wind className="h-3.5 w-3.5" />}
                  value={`${weather.current.windSpeed} km/h`}
                  label={weather.current.windDirection || 'Wind'}
                />
                <MetricChip
                  icon={<CloudRain className="h-3.5 w-3.5" />}
                  value={`${todayRain}%`}
                  label={todayRainMm > 0 ? `${todayRainMm} mm rain` : 'Rain chance'}
                />
                <MetricChip
                  icon={<Gauge className="h-3.5 w-3.5" />}
                  value={weather.current.pressure ? `${weather.current.pressure}` : '—'}
                  label="hPa pressure"
                />
                <MetricChip
                  icon={<Eye className="h-3.5 w-3.5" />}
                  value={
                    weather.current.visibilityKm != null
                      ? `${weather.current.visibilityKm} km`
                      : '—'
                  }
                  label="Visibility"
                />
                <MetricChip
                  icon={<Leaf className="h-3.5 w-3.5" />}
                  value={todayRain >= 50 ? 'Hold' : todayRain >= 25 ? 'Watch' : 'Spray'}
                  label="Field window"
                />
              </div>

              <div className="relative mt-4 flex items-start gap-2.5 rounded-2xl border border-[#7EC8E3]/30 bg-[#0B2A36]/35 p-3">
                <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-[#C9F169]" />
                <p className="text-[12px] font-semibold leading-relaxed text-[#EAF8B8]">
                  {weather.farmingTip}
                </p>
              </div>
            </motion.div>

            <div className="flex min-h-0 flex-col lg:col-span-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#3D6A8A]">
                  Spray-window outlook
                </p>
                <p className="hidden text-[11px] text-[#5C6B60] sm:block">
                  Rain in blue · spray advice on the badge
                </p>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
                {weather.days.map((day, index) => {
                  const risk = getWeatherRisk(day)
                  const rain = day.rainChance ?? day.rain ?? 0
                  const isToday = index === 0 || day.day.toLowerCase() === 'today'

                  return (
                    <motion.div
                      key={`${day.day}-${day.date ?? day.high}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`flex min-w-[8.4rem] flex-col rounded-[20px] border px-3 py-3 transition-all sm:min-w-0 ${
                        isToday
                          ? 'border-[#1D4E6B] bg-gradient-to-b from-[#164A38] to-[#1D4E6B] text-white shadow-[0_8px_20px_rgba(29,78,107,.22)]'
                          : risk.cardClass
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                            isToday ? 'text-[#B8E0F0]' : 'text-[#3D6A8A]'
                          }`}
                        >
                          {isToday ? 'Today' : day.day}
                        </span>
                        <WeatherIconDisplay
                          icon={day.icon}
                          className={`h-4 w-4 ${isToday ? 'text-[#E8F6FF]' : ''}`}
                        />
                      </div>
                      <p
                        className={`mt-1 line-clamp-1 text-[11px] capitalize ${
                          isToday ? 'text-white/75' : 'text-[#5C6B60]'
                        }`}
                      >
                        {day.description}
                      </p>
                      <div
                        className={`mt-1.5 font-['Bricolage_Grotesque',Inter,sans-serif] text-[18px] font-bold ${
                          isToday ? 'text-white' : 'text-[#10241A]'
                        }`}
                      >
                        {day.high}°
                        <span className={`ml-1 text-[12px] font-medium ${isToday ? 'text-white/60' : 'text-[#5C6B60]'}`}>
                          {day.low}°
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <div
                          className={`mb-1 flex items-center justify-between text-[10px] font-semibold ${
                            isToday ? 'text-white/75' : 'text-[#3D6A8A]'
                          }`}
                        >
                          <span>Rain {rain}%</span>
                          <span>{day.rainMm > 0 ? `${day.rainMm} mm` : '0 mm'}</span>
                        </div>
                        <div className={`h-1.5 overflow-hidden rounded-full ${isToday ? 'bg-white/15' : 'bg-[#D7E6F5]'}`}>
                          <div
                            className="h-full rounded-full bg-[#2F80ED]"
                            style={{ width: `${Math.max(8, Math.min(rain, 100))}%` }}
                          />
                        </div>
                      </div>

                      <div
                        className={`mt-2 space-y-0.5 text-[10px] font-medium ${
                          isToday ? 'text-white/75' : 'text-[#5C6B60]'
                        }`}
                      >
                        <div>Humidity {day.humidity}%</div>
                        <div>
                          Wind {day.windSpeed} km/h {day.windDirection}
                        </div>
                      </div>

                      <span
                        className={`mt-2.5 self-start rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          isToday ? 'bg-[#2F80ED]/25 text-[#D6ECFF]' : risk.className
                        }`}
                      >
                        {risk.label}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
              <WeatherPeriodCards weekly={weather.weekly} monthly={weather.monthly} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricChip({
  icon,
  value,
  label,
}: {
  icon: ReactNode
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl bg-white/10 px-2.5 py-2 backdrop-blur-md">
      <div className="text-[#B8E0F0]">{icon}</div>
      <div className="mt-1 text-[13px] font-extrabold leading-tight">{value}</div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-white/65">{label}</div>
    </div>
  )
}
