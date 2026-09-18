import { Droplets, Wind, Umbrella, Loader2, Leaf, Gauge, Eye } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Farm, WeatherForecast } from '@/types'
import { WeatherIconDisplay, getWeatherRisk } from './dashboardUtils'
import { FarmWeatherSelect } from './FarmWeatherSelect'
import { WeatherPeriodCards } from './WeatherPeriodCards'

interface MobileWeatherHeroProps {
  farms: Farm[]
  selectedFarmId?: string
  onSelectFarm: (farmId: string) => void
  weather?: WeatherForecast
  loading?: boolean
}

export function MobileWeatherHero({
  farms,
  selectedFarmId,
  onSelectFarm,
  weather,
  loading,
}: MobileWeatherHeroProps) {
  const today = weather?.days?.[0]
  const todayRain = today?.rainChance ?? weather?.current?.rainChance ?? 0
  const todayRainMm = today?.rainMm ?? 0

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E3A2F] via-[#164A38] to-[#1D4E6B] p-5 text-white shadow-[0_10px_28px_rgba(29,78,107,0.28)]">
      <div className="pointer-events-none absolute -right-8 -top-12 h-52 w-52 rounded-full bg-[#7EC8E3]/20 blur-2xl" />
      <div className="pointer-events-none absolute right-[-20px] bottom-[-40px] h-48 w-48 rounded-full bg-[#C9F169]/15" />

      <div className="relative flex items-center justify-between gap-3">
        <FarmWeatherSelect
          farms={farms}
          selectedFarmId={selectedFarmId}
          onChange={onSelectFarm}
          variant="dark"
        />
        <span className="shrink-0 rounded-full bg-[#2F80ED]/25 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#D6ECFF] backdrop-blur-xs">
          Today
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-[#B8E0F0]" />
        </div>
      ) : (
        <>
          <div className="relative mt-3 flex items-center justify-between">
            <div>
              <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[52px] font-extrabold leading-none tracking-tight text-white">
                {weather?.current?.temp ?? '—'}°
              </div>
              <div className="mt-1 text-[13px] font-medium capitalize text-white/85">
                {weather?.current?.description
                  ? `${weather.current.description} · feels like ${weather.current.feelsLike}°`
                  : 'Forecast unavailable'}
              </div>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#7EC8E3]/20 text-[#E8F6FF] shadow-xs backdrop-blur-md">
              <WeatherIconDisplay icon={weather?.current?.icon ?? 'sun'} className="h-7 w-7 text-[#E8F6FF]" />
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <MiniStat
              icon={<Droplets className="h-4 w-4 text-[#B8E0F0]" />}
              value={`${weather?.current?.humidity ?? '—'}%`}
              label="Humidity"
            />
            <MiniStat
              icon={<Wind className="h-4 w-4 text-[#B8E0F0]" />}
              value={`${weather?.current?.windSpeed ?? '—'} km/h`}
              label={weather?.current?.windDirection || 'Wind'}
            />
            <MiniStat
              icon={<Umbrella className="h-4 w-4 text-[#B8E0F0]" />}
              value={`${todayRain}%`}
              label={todayRainMm > 0 ? `${todayRainMm} mm` : 'Rain'}
            />
            <MiniStat
              icon={<Gauge className="h-4 w-4 text-[#B8E0F0]" />}
              value={weather?.current?.pressure ? `${weather.current.pressure}` : '—'}
              label="hPa"
            />
            <MiniStat
              icon={<Eye className="h-4 w-4 text-[#B8E0F0]" />}
              value={
                weather?.current?.visibilityKm != null ? `${weather.current.visibilityKm} km` : '—'
              }
              label="Visibility"
            />
            <MiniStat
              icon={<Leaf className="h-4 w-4 text-[#C9F169]" />}
              value={todayRain >= 50 ? 'Hold' : todayRain >= 25 ? 'Watch' : 'Spray'}
              label="Window"
            />
          </div>

          {weather?.farmingTip ? (
            <div className="relative mt-3 flex items-start gap-2 rounded-2xl border border-[#7EC8E3]/25 bg-[#0B2A36]/35 p-3">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-[#C9F169]" />
              <p className="text-[12px] font-semibold leading-relaxed text-[#EAF8B8]">
                {weather.farmingTip}
              </p>
            </div>
          ) : null}

          {weather?.days?.length ? (
            <div className="relative mt-4 flex gap-2 overflow-x-auto pb-1">
              {weather.days.map((day, index) => {
                const rain = day.rainChance ?? day.rain ?? 0
                const risk = getWeatherRisk(day)
                const isToday = index === 0 || day.day.toLowerCase() === 'today'
                return (
                  <div
                    key={`${day.day}-${day.date}`}
                    className={`min-w-[6.4rem] rounded-2xl px-2.5 py-2.5 ${
                      isToday ? 'bg-[#2F80ED]/25' : 'bg-white/10'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#B8E0F0]">
                      {isToday ? 'Today' : day.day}
                    </div>
                    <WeatherIconDisplay icon={day.icon} className="mx-auto my-1 h-5 w-5 text-[#E8F6FF]" />
                    <div className="text-[12px] font-extrabold">
                      {day.high}°
                      <span className="ml-0.5 text-[10px] font-medium text-white/60">{day.low}°</span>
                    </div>
                    <div className="mt-1 text-[9px] font-semibold text-[#D6ECFF]">
                      {rain}% · {day.rainMm > 0 ? `${day.rainMm} mm` : '0 mm'}
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-[#7EC8E3]"
                        style={{ width: `${Math.max(8, Math.min(rain, 100))}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[9px] font-bold text-[#C9F169]">{risk.label}</div>
                  </div>
                )
              })}
            </div>
          ) : null}
          <WeatherPeriodCards weekly={weather?.weekly} monthly={weather?.monthly} compact />
        </>
      )}
    </div>
  )
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-[16px] bg-white/10 px-3 py-2.5 backdrop-blur-md">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-extrabold leading-tight text-white">{value}</div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider leading-tight text-white/75">
          {label}
        </div>
      </div>
    </div>
  )
}
