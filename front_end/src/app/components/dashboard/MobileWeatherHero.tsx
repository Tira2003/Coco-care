import { MapPin, Droplets, Wind, Umbrella } from 'lucide-react'
import type { WeatherForecast } from '@/types'
import { WeatherIconDisplay } from './dashboardUtils'

interface MobileWeatherHeroProps {
  farmName: string
  weather?: WeatherForecast
}

export function MobileWeatherHero({ farmName, weather }: MobileWeatherHeroProps) {
  return (
    <div className="relative overflow-hidden bg-[#2E5A27] rounded-[26px] p-5 text-white shadow-[0_6px_24px_rgba(46,90,39,0.22)]">
      {/* Subtle curved layered shapes */}
      <div className="absolute -right-8 -top-12 w-52 h-52 rounded-full bg-white/[0.07] pointer-events-none" />
      <div className="absolute right-[-20px] bottom-[-40px] w-48 h-48 rounded-full bg-[#3D7133]/50 pointer-events-none" />
      <div className="absolute left-[30%] bottom-[-50px] w-44 h-44 rounded-full bg-white/[0.04] pointer-events-none" />

      {/* Location & TODAY pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px] text-white/90 font-medium">
          <MapPin className="h-4 w-4 text-white/80" />
          <span>{farmName}</span>
        </div>
        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold tracking-wider uppercase backdrop-blur-xs">
          TODAY
        </span>
      </div>

      {/* Temperature & description + weather icon */}
      <div className="flex items-center justify-between mt-3">
        <div>
          <div className="text-[48px] font-extrabold text-white leading-none font-['Bricolage_Grotesque',Inter,sans-serif] tracking-tight">
            {weather?.current?.temp ?? 29}°
          </div>
          <div className="text-[13px] text-white/85 font-medium mt-1">
            {weather?.current?.description
              ? `${weather.current.description} · feels like ${Math.round((weather.current.temp ?? 29) + 2)}°`
              : 'Partly cloudy · feels like 31°'}
          </div>
        </div>

        {/* Frosted glass icon box */}
        <div className="w-13 h-13 rounded-[20px] bg-white/15 backdrop-blur-md flex items-center justify-center text-[#D8F396] shadow-xs shrink-0">
          <WeatherIconDisplay icon={weather?.current?.icon ?? 'sun'} className="w-7 h-7 text-[#D8F396]" />
        </div>
      </div>

      {/* 3 micro-metric badges (Humidity, Wind, Rain) */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-1">
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-[16px] py-2.5 px-3">
          <Droplets className="h-4 w-4 text-[#D8F396] shrink-0" />
          <div className="min-w-0">
            <div className="text-[13px] font-extrabold text-white leading-tight">
              {weather?.current?.humidity ?? 78}%
            </div>
            <div className="text-[9px] font-bold text-white/75 tracking-wider uppercase leading-tight mt-0.5">
              HUMIDITY
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-[16px] py-2.5 px-3">
          <Wind className="h-4 w-4 text-[#D8F396] shrink-0" />
          <div className="min-w-0">
            <div className="text-[13px] font-extrabold text-white leading-tight">
              {weather?.current?.windSpeed ?? 12} km/h
            </div>
            <div className="text-[9px] font-bold text-white/75 tracking-wider uppercase leading-tight mt-0.5">
              WIND
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-[16px] py-2.5 px-3">
          <Umbrella className="h-4 w-4 text-[#D8F396] shrink-0" />
          <div className="min-w-0">
            <div className="text-[13px] font-extrabold text-white leading-tight">
              {weather?.days?.[0] ? `${weather.days[0].rainChance ?? weather.days[0].rain ?? 0}%` : '0%'}
            </div>
            <div className="text-[9px] font-bold text-white/75 tracking-wider uppercase leading-tight mt-0.5">
              RAIN
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
