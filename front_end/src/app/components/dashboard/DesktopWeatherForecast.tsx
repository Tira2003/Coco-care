import { Loader2, Droplets, Wind } from 'lucide-react'
import type { WeatherForecast } from '@/types'
import { WeatherIconDisplay, getWeatherRisk } from './dashboardUtils'

interface DesktopWeatherForecastProps {
  weather?: WeatherForecast
  farmRegion: string
  weatherLoading: boolean
  weatherError: boolean
  weatherErrorMessage?: string
}

export function DesktopWeatherForecast({
  weather,
  farmRegion,
  weatherLoading,
  weatherError,
  weatherErrorMessage,
}: DesktopWeatherForecastProps) {
  return (
    <div className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-[0_1px_2px_rgba(16,36,26,.04),0_4px_12px_rgba(16,36,26,.05)] sm:rounded-[20px] sm:p-5 lg:p-6">
      <div className="mb-3 flex flex-col gap-0.5 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-1">
        <div>
          <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-base font-bold text-[#10241A] sm:text-lg lg:text-xl">
            Weather & Microclimate Forecast
          </h2>
          <p className="text-[10px] text-[#5C6B60] sm:text-xs">
            {weather?.location ?? farmRegion}, Sri Lanka · 7-day agronomic outlook
          </p>
        </div>
      </div>

      {weatherLoading ? (
        <div className="flex justify-center py-12 sm:py-16">
          <Loader2 className="h-7 w-7 animate-spin text-[#123524] sm:h-8 sm:w-8" />
        </div>
      ) : weatherError || !weather ? (
        <div className="space-y-1.5 py-6 text-center text-[11px] text-[#5C6B60] sm:py-8 sm:text-xs">
          <p>Weather data temporarily unavailable.</p>
          {weatherErrorMessage && (
            <p className="mx-auto max-w-md text-red-600">{weatherErrorMessage}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
          {/* Current conditions box */}
          <div className="flex flex-col justify-between rounded-2xl bg-[#123524] p-4 text-white shadow-sm sm:p-5 lg:col-span-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[28px] font-bold leading-none sm:text-3xl lg:text-4xl">
                    {weather.current.temp}°C
                  </div>
                  <div className="mt-1 text-[10px] text-[#AEC0A6] sm:text-xs">
                    {weather.location ?? farmRegion} · Now
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/80 capitalize sm:text-xs">
                    {weather.current.description} · Feels like {weather.current.feelsLike}°C
                  </div>
                </div>
                <WeatherIconDisplay
                  icon={weather.current.icon}
                  className="h-8 w-8 shrink-0 text-[#C9F169] sm:h-10 sm:w-10"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(201,241,105,.16)] px-2 py-0.5 text-[10px] font-semibold text-[#C9F169] sm:px-2.5 sm:py-1 sm:text-xs">
                  <Droplets className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {weather.current.humidity}% humidity
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(201,241,105,.16)] px-2 py-0.5 text-[10px] font-semibold text-[#C9F169] sm:px-2.5 sm:py-1 sm:text-xs">
                  <Wind className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {weather.current.windSpeed} km/h {weather.current.windDirection}
                </span>
              </div>
            </div>

            {/* Farming tip banner */}
            <div className="mt-3 rounded-xl border border-[rgba(201,241,105,.3)] bg-[rgba(201,241,105,.14)] p-2.5 text-[10px] font-semibold leading-relaxed text-[#C9F169] sm:mt-5 sm:p-3 sm:text-xs">
              ✓ Spray window: today 6 – 9 AM ·{' '}
              {weather.farmingTip || 'Optimal conditions for foliar application'}
            </div>
          </div>

          {/* 7-day outlook — horizontal scroll on mobile, grid on desktop */}
          <div className="lg:col-span-8">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin sm:grid sm:grid-cols-3 sm:gap-2.5 sm:overflow-visible sm:pb-0 md:grid-cols-6">
              {weather.days.map((day) => {
                const risk = getWeatherRisk(day)
                return (
                  <div
                    key={`${day.day}-${day.date ?? day.high}`}
                    className="flex min-w-[5.5rem] flex-col items-center justify-between gap-1 rounded-2xl border border-[#E6EADF] bg-[#F6F7F2]/40 p-2.5 text-center transition-all hover:border-[#BFD98F] hover:bg-white sm:min-w-0 sm:gap-1.5 sm:p-3"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6B60] sm:text-[11px]">
                      {day.day}
                    </span>
                    <WeatherIconDisplay
                      icon={day.icon}
                      className="my-0.5 h-6 w-6 sm:my-1 sm:h-7 sm:w-7"
                    />
                    <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[13px] font-bold text-[#10241A] sm:text-sm">
                      {day.high}° <small className="text-[10px] font-medium text-[#5C6B60] sm:text-xs">{day.low}°</small>
                    </div>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:px-2 sm:text-[10px] ${risk.className}`}
                    >
                      {risk.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
