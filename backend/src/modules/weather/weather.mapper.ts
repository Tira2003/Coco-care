import type { WeatherDay, WeatherForecast, WeatherIcon, WeatherPeriodSummary } from '../../types/index.js'

export type OpenWeatherCurrent = {
  name?: string
  weather?: Array<{ description?: string; icon?: string }>
  main?: {
    temp?: number
    feels_like?: number
    humidity?: number
    pressure?: number
  }
  wind?: { speed?: number; deg?: number }
  visibility?: number
  rain?: { '1h'?: number }
}

export type OpenWeatherForecastItem = {
  dt: number
  main?: {
    temp?: number
    temp_min?: number
    temp_max?: number
    humidity?: number
    feels_like?: number
  }
  weather?: Array<{ description?: string; icon?: string }>
  wind?: { speed?: number; deg?: number }
  pop?: number
  rain?: { '3h'?: number }
}

export type OpenWeatherForecast = {
  city?: { name?: string }
  list?: OpenWeatherForecastItem[]
}

export type OpenWeatherOneCall = {
  timezone?: string
  current?: {
    temp?: number
    feels_like?: number
    humidity?: number
    pressure?: number
    wind_speed?: number
    wind_deg?: number
    visibility?: number
    weather?: Array<{ description?: string; icon?: string }>
  }
  daily?: Array<{
    dt: number
    temp?: { min?: number; max?: number }
    feels_like?: { day?: number }
    humidity?: number
    wind_speed?: number
    wind_deg?: number
    pop?: number
    rain?: number
    weather?: Array<{ description?: string; icon?: string }>
  }>
}

const COLOMBO_TZ = 'Asia/Colombo'

export function mapWeatherIcon(code?: string): WeatherIcon {
  const value = (code ?? '').toLowerCase()
  if (value.startsWith('01')) return 'sun'
  if (value.startsWith('02')) return 'partly'
  if (value.startsWith('09') || value.startsWith('10') || value.startsWith('11')) return 'rain'
  return 'cloud'
}

export function mapWmoIcon(code?: number): WeatherIcon {
  const value = code ?? 0
  if (value <= 1) return 'sun'
  if (value === 2) return 'partly'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(value)) {
    return 'rain'
  }
  return 'cloud'
}

export function wmoDescription(code?: number): string {
  const value = code ?? 0
  if (value === 0) return 'clear sky'
  if (value === 1) return 'mainly clear'
  if (value === 2) return 'partly cloudy'
  if (value === 3) return 'overcast'
  if (value === 45 || value === 48) return 'fog'
  if (value >= 51 && value <= 57) return 'drizzle'
  if (value >= 61 && value <= 67) return 'rain'
  if (value >= 80 && value <= 82) return 'rain showers'
  if (value >= 95) return 'thunderstorm'
  return 'cloudy'
}

export function msToKmh(speedMs: number) {
  return Math.round(speedMs * 3.6)
}

export function degreesToCardinal(deg?: number) {
  if (deg == null || Number.isNaN(deg)) return ''
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(deg / 45) % 8
  return directions[index] ?? 'N'
}

function colomboDateKey(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleDateString('en-CA', { timeZone: COLOMBO_TZ })
}

function colomboWeekday(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: COLOMBO_TZ,
  })
}

function todayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: COLOMBO_TZ })
}

export function buildFarmingTip(input: {
  rainChance: number
  windSpeed: number
  humidity: number
}) {
  if (input.rainChance >= 60) {
    return 'Heavy rain likely — skip spraying and check drainage around the palms.'
  }
  if (input.rainChance >= 40) {
    return 'Showers expected — delay foliar sprays until a dry window.'
  }
  if (input.windSpeed >= 20) {
    return 'Windy conditions — postpone spraying so droplets are not blown off leaflets.'
  }
  if (input.humidity >= 85) {
    return 'High humidity favours fungal spread — inspect spear leaves and avoid evening irrigation.'
  }
  return 'Good spray window this morning (6–9 AM) in light wind and low rain risk.'
}

export function groupForecastDays(items: OpenWeatherForecastItem[]): WeatherDay[] {
  const buckets = new Map<
    string,
    {
      unix: number
      highs: number[]
      lows: number[]
      humidity: number[]
      feels: number[]
      rainChance: number
      rainMm: number
      wind: number[]
      windDeg: number[]
      description: string
      icon: string
    }
  >()

  for (const item of items) {
    const key = colomboDateKey(item.dt)
    const existing = buckets.get(key)
    const high = item.main?.temp_max ?? item.main?.temp ?? 0
    const low = item.main?.temp_min ?? item.main?.temp ?? 0
    const humidity = item.main?.humidity ?? 0
    const feels = item.main?.feels_like ?? item.main?.temp ?? 0
    const rainChance = Math.round((item.pop ?? 0) * 100)
    const rainMm = item.rain?.['3h'] ?? 0
    const wind = msToKmh(item.wind?.speed ?? 0)
    const description = item.weather?.[0]?.description ?? 'clear sky'
    const icon = item.weather?.[0]?.icon ?? '01d'

    if (!existing) {
      buckets.set(key, {
        unix: item.dt,
        highs: [high],
        lows: [low],
        humidity: [humidity],
        feels: [feels],
        rainChance,
        rainMm,
        wind: [wind],
        windDeg: item.wind?.deg != null ? [item.wind.deg] : [],
        description,
        icon,
      })
      continue
    }

    existing.highs.push(high)
    existing.lows.push(low)
    existing.humidity.push(humidity)
    existing.feels.push(feels)
    existing.rainChance = Math.max(existing.rainChance, rainChance)
    existing.rainMm += rainMm
    existing.wind.push(wind)
    if (item.wind?.deg != null) existing.windDeg.push(item.wind.deg)
    if (icon.includes('d')) {
      existing.description = description
      existing.icon = icon
    }
  }

  const today = todayKey()
  return [...buckets.entries()].slice(0, 5).map(([date, bucket]) => {
    const avg = (values: number[]) =>
      values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0
    return {
      day: date === today ? 'Today' : colomboWeekday(bucket.unix),
      date,
      high: Math.round(Math.max(...bucket.highs)),
      low: Math.round(Math.min(...bucket.lows)),
      rainChance: bucket.rainChance,
      rain: bucket.rainChance,
      rainMm: Math.round(bucket.rainMm * 10) / 10,
      humidity: avg(bucket.humidity),
      windSpeed: avg(bucket.wind),
      windDirection: degreesToCardinal(bucket.windDeg[0]),
      feelsLike: avg(bucket.feels),
      description: bucket.description,
      icon: mapWeatherIcon(bucket.icon),
    }
  })
}

export function toForecast(
  location: string,
  current: OpenWeatherCurrent,
  forecast: OpenWeatherForecast,
): WeatherForecast {
  const days = groupForecastDays(forecast.list ?? [])
  const rainChance = days[0]?.rainChance ?? 0
  const windSpeed = msToKmh(current.wind?.speed ?? 0)
  const humidity = Math.round(current.main?.humidity ?? 0)
  const temp = Math.round(current.main?.temp ?? 0)
  const feelsLike = Math.round(current.main?.feels_like ?? temp)
  const description = current.weather?.[0]?.description ?? 'clear sky'

  return {
    location: current.name || forecast.city?.name || location,
    current: {
      temp,
      feelsLike,
      description,
      humidity,
      windSpeed,
      windDirection: degreesToCardinal(current.wind?.deg),
      rainChance,
      pressure: Math.round(current.main?.pressure ?? 0),
      visibilityKm:
        current.visibility != null ? Math.round((current.visibility / 1000) * 10) / 10 : null,
      icon: mapWeatherIcon(current.weather?.[0]?.icon),
    },
    days,
    farmingTip: buildFarmingTip({ rainChance, windSpeed, humidity }),
  }
}

export function toForecastFromOneCall(
  location: string,
  payload: OpenWeatherOneCall,
): WeatherForecast {
  const current = payload.current
  const daily = payload.daily ?? []
  const today = daily[0]
  const rainChance = Math.round((today?.pop ?? 0) * 100)
  const windSpeed = msToKmh(current?.wind_speed ?? 0)
  const humidity = Math.round(current?.humidity ?? 0)
  const temp = Math.round(current?.temp ?? 0)
  const feelsLike = Math.round(current?.feels_like ?? temp)
  const description = current?.weather?.[0]?.description ?? 'clear sky'
  const todayKeyValue = todayKey()

  const days: WeatherDay[] = daily.slice(0, 7).map((item) => {
    const date = colomboDateKey(item.dt)
    return {
      day: date === todayKeyValue ? 'Today' : colomboWeekday(item.dt),
      date,
      high: Math.round(item.temp?.max ?? 0),
      low: Math.round(item.temp?.min ?? 0),
      rainChance: Math.round((item.pop ?? 0) * 100),
      rain: Math.round((item.pop ?? 0) * 100),
      rainMm: Math.round((item.rain ?? 0) * 10) / 10,
      humidity: Math.round(item.humidity ?? 0),
      windSpeed: msToKmh(item.wind_speed ?? 0),
      windDirection: degreesToCardinal(item.wind_deg),
      feelsLike: Math.round(item.feels_like?.day ?? item.temp?.max ?? 0),
      description: item.weather?.[0]?.description ?? 'clear sky',
      icon: mapWeatherIcon(item.weather?.[0]?.icon),
    }
  })

  return {
    location,
    current: {
      temp,
      feelsLike,
      description,
      humidity,
      windSpeed,
      windDirection: degreesToCardinal(current?.wind_deg),
      rainChance,
      pressure: Math.round(current?.pressure ?? 0),
      visibilityKm:
        current?.visibility != null ? Math.round((current.visibility / 1000) * 10) / 10 : null,
      icon: mapWeatherIcon(current?.weather?.[0]?.icon),
    },
    days,
    farmingTip: buildFarmingTip({ rainChance, windSpeed, humidity }),
  }
}

export type OpenMeteoForecast = {
  current?: {
    temperature_2m?: number
    apparent_temperature?: number
    relative_humidity_2m?: number
    weather_code?: number
    wind_speed_10m?: number
    wind_direction_10m?: number
    surface_pressure?: number
  }
  daily?: {
    time?: string[]
    weather_code?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    precipitation_probability_max?: number[]
    precipitation_sum?: number[]
    wind_speed_10m_max?: number[]
    wind_direction_10m_dominant?: number[]
    relative_humidity_2m_mean?: number[]
    apparent_temperature_max?: number[]
  }
}

export function openMeteoDailyToDays(payload: OpenMeteoForecast): WeatherDay[] {
  const current = payload.current
  const daily = payload.daily
  const dates = daily?.time ?? []
  const todayKeyValue = todayKey()
  return dates.map((date, index) => {
    const rainChance = Math.round(daily?.precipitation_probability_max?.[index] ?? 0)
    return {
      day: date === todayKeyValue ? 'Today' : colomboWeekday(Date.parse(`${date}T12:00:00+05:30`) / 1000),
      date,
      high: Math.round(daily?.temperature_2m_max?.[index] ?? 0),
      low: Math.round(daily?.temperature_2m_min?.[index] ?? 0),
      rainChance,
      rain: rainChance,
      rainMm: Math.round((daily?.precipitation_sum?.[index] ?? 0) * 10) / 10,
      humidity: Math.round(daily?.relative_humidity_2m_mean?.[index] ?? current?.relative_humidity_2m ?? 0),
      windSpeed: Math.round(daily?.wind_speed_10m_max?.[index] ?? 0),
      windDirection: degreesToCardinal(daily?.wind_direction_10m_dominant?.[index]),
      feelsLike: Math.round(daily?.apparent_temperature_max?.[index] ?? 0),
      description: wmoDescription(daily?.weather_code?.[index]),
      icon: mapWmoIcon(daily?.weather_code?.[index]),
    }
  })
}

export function summarizeDays(
  days: WeatherDay[],
  title: string,
  period: string,
): WeatherPeriodSummary | undefined {
  if (days.length === 0) return undefined

  const avg = (values: number[]) =>
    values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0

  const totalRainMm = Math.round(days.reduce((sum, day) => sum + (day.rainMm ?? 0), 0) * 10) / 10
  const rainDays = days.filter((day) => (day.rainMm ?? 0) >= 1 || (day.rainChance ?? 0) >= 50).length
  const sprayOkDays = days.filter((day) => (day.rainChance ?? 0) < 25).length
  const wettest = [...days].sort((a, b) => (b.rainMm ?? 0) - (a.rainMm ?? 0))[0]
  const avgRainChance = avg(days.map((day) => day.rainChance ?? 0))

  let headline = 'Mixed conditions — pick dry hours for spraying.'
  if (avgRainChance >= 60 || rainDays >= Math.ceil(days.length * 0.6)) {
    headline = 'Wet period — skip spraying and watch drainage around the palms.'
  } else if (sprayOkDays >= Math.ceil(days.length * 0.5)) {
    headline = 'Several spray-ok days — use calm, dry mornings.'
  } else if (avg(days.map((day) => day.windSpeed)) >= 20) {
    headline = 'Breezy stretch — postpone foliar sprays if wind stays high.'
  }

  return {
    title,
    period,
    avgHigh: avg(days.map((day) => day.high)),
    avgLow: avg(days.map((day) => day.low)),
    totalRainMm,
    rainDays,
    dryDays: Math.max(0, days.length - rainDays),
    avgHumidity: avg(days.map((day) => day.humidity)),
    avgWind: avg(days.map((day) => day.windSpeed)),
    sprayOkDays,
    wettestDay: wettest ? `${wettest.day} · ${wettest.rainMm ?? 0} mm` : '—',
    headline,
  }
}

export function formatDayRange(days: WeatherDay[]) {
  if (days.length === 0) return ''
  const start = days[0]?.date
  const end = days[days.length - 1]?.date
  if (!start || !end) return ''
  const fmt = (value: string) =>
    new Date(`${value}T12:00:00+05:30`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      timeZone: COLOMBO_TZ,
    })
  return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`
}

export function buildWeeklyAndMonthlySummaries(days: WeatherDay[]) {
  const today = todayKey()
  const monthPrefix = today.slice(0, 7)
  const weeklyDays = days.filter((day) => day.date >= today).slice(0, 7)
  const monthlyDays = days.filter((day) => day.date.startsWith(monthPrefix))
  const monthName = new Date(`${today}T12:00:00+05:30`).toLocaleDateString('en-US', {
    month: 'long',
    timeZone: COLOMBO_TZ,
  })

  return {
    weekly: summarizeDays(
      weeklyDays.length ? weeklyDays : days.slice(0, 7),
      'Overall weekly',
      formatDayRange(weeklyDays) || 'Next 7 days',
    ),
    monthly: summarizeDays(
      monthlyDays,
      'Overall monthly',
      monthlyDays.length ? `${monthName} · ${formatDayRange(monthlyDays)}` : monthName,
    ),
  }
}

export function toForecastFromOpenMeteo(
  location: string,
  payload: OpenMeteoForecast,
): WeatherForecast {
  const current = payload.current
  const days = openMeteoDailyToDays(payload).slice(0, 7)

  const rainChance = days[0]?.rainChance ?? 0
  const windSpeed = Math.round(current?.wind_speed_10m ?? 0)
  const humidity = Math.round(current?.relative_humidity_2m ?? 0)
  const temp = Math.round(current?.temperature_2m ?? 0)
  const feelsLike = Math.round(current?.apparent_temperature ?? temp)

  return {
    location,
    current: {
      temp,
      feelsLike,
      description: wmoDescription(current?.weather_code),
      humidity,
      windSpeed,
      windDirection: degreesToCardinal(current?.wind_direction_10m),
      rainChance,
      pressure: Math.round(current?.surface_pressure ?? 0),
      visibilityKm: null,
      icon: mapWmoIcon(current?.weather_code),
    },
    days,
    farmingTip: buildFarmingTip({ rainChance, windSpeed, humidity }),
  }
}
