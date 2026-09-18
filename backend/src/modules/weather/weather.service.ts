import { centroidForLocation } from '../../constants/districts.js'
import { env } from '../../config/env.js'
import { badRequest, notFound, serviceUnavailable } from '../../utils/errors.js'
import type { Farm, WeatherForecast } from '../../types/index.js'
import { findFarmByIdForUser } from '../auth/auth.repository.js'
import type { WeatherQuery } from './weather.schemas.js'
import {
  buildWeeklyAndMonthlySummaries,
  formatDayRange,
  openMeteoDailyToDays,
  summarizeDays,
  toForecast,
  toForecastFromOneCall,
  toForecastFromOpenMeteo,
  type OpenMeteoForecast,
  type OpenWeatherCurrent,
  type OpenWeatherForecast,
  type OpenWeatherOneCall,
} from './weather.mapper.js'

const CACHE_TTL_MS = 20 * 60 * 1000
const forecastCache = new Map<string, { expiresAt: number; data: WeatherForecast }>()

function hasCoords(lat?: number, lon?: number) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    !(lat === 0 && lon === 0)
  )
}

function cacheKey(lat: number, lon: number) {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`
}

export async function resolveFarmWeatherQuery(
  userId: string,
  query: WeatherQuery,
): Promise<{ latitude: number; longitude: number; location: string; farm?: Farm }> {
  if (query.farmId) {
    const farm = await findFarmByIdForUser(query.farmId, userId)
    if (!farm) {
      throw notFound('Farm not found')
    }
    if (hasCoords(farm.latitude, farm.longitude)) {
      return {
        latitude: farm.latitude,
        longitude: farm.longitude,
        location: farm.location,
        farm,
      }
    }
    const centroid = centroidForLocation(farm.location)
    return {
      latitude: centroid.latitude,
      longitude: centroid.longitude,
      location: farm.location,
      farm,
    }
  }

  if (hasCoords(query.lat, query.lon)) {
    return {
      latitude: query.lat!,
      longitude: query.lon!,
      location: query.location || 'Farm location',
    }
  }

  if (query.location) {
    const centroid = centroidForLocation(query.location)
    return {
      latitude: centroid.latitude,
      longitude: centroid.longitude,
      location: query.location,
    }
  }

  throw badRequest('Select a farm or provide a location to load the forecast')
}

async function fetchJson(url: URL) {
  const response = await fetch(url)
  return { ok: response.ok, status: response.status, payload: await response.json().catch(() => null) }
}

async function getForecastOpenWeather(latitude: number, longitude: number, location: string) {
  const apiKey = env.openWeatherApiKey.trim()
  if (!apiKey) return null

  const oneCall = new URL('https://api.openweathermap.org/data/3.0/onecall')
  oneCall.searchParams.set('lat', String(latitude))
  oneCall.searchParams.set('lon', String(longitude))
  oneCall.searchParams.set('exclude', 'minutely,hourly,alerts')
  oneCall.searchParams.set('units', 'metric')
  oneCall.searchParams.set('appid', apiKey)

  const oneCallResult = await fetchJson(oneCall)
  if (oneCallResult.ok && oneCallResult.payload) {
    return { ...toForecastFromOneCall(location, oneCallResult.payload as OpenWeatherOneCall), location }
  }

  const currentUrl = new URL('https://api.openweathermap.org/data/2.5/weather')
  currentUrl.searchParams.set('lat', String(latitude))
  currentUrl.searchParams.set('lon', String(longitude))
  currentUrl.searchParams.set('units', 'metric')
  currentUrl.searchParams.set('appid', apiKey)

  const forecastUrl = new URL('https://api.openweathermap.org/data/2.5/forecast')
  forecastUrl.searchParams.set('lat', String(latitude))
  forecastUrl.searchParams.set('lon', String(longitude))
  forecastUrl.searchParams.set('units', 'metric')
  forecastUrl.searchParams.set('appid', apiKey)

  const [currentResult, forecastResult] = await Promise.all([fetchJson(currentUrl), fetchJson(forecastUrl)])
  if (currentResult.ok && forecastResult.ok && currentResult.payload && forecastResult.payload) {
    return {
      ...toForecast(
        location,
        currentResult.payload as OpenWeatherCurrent,
        forecastResult.payload as OpenWeatherForecast,
      ),
      location,
    }
  }

  return null
}

const OPEN_METEO_DAILY =
  'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,relative_humidity_2m_mean,apparent_temperature_max'

function openMeteoUrl(latitude: number, longitude: number, extra: Record<string, string>) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
  )
  url.searchParams.set('daily', OPEN_METEO_DAILY)
  url.searchParams.set('timezone', 'Asia/Colombo')
  url.searchParams.set('wind_speed_unit', 'kmh')
  for (const [key, value] of Object.entries(extra)) {
    url.searchParams.set(key, value)
  }
  return url
}

async function getForecastOpenMeteo(latitude: number, longitude: number, location: string) {
  const url = openMeteoUrl(latitude, longitude, { forecast_days: '7' })
  const response = await fetch(url)
  if (!response.ok) {
    throw serviceUnavailable('Weather request failed')
  }
  const payload = (await response.json()) as OpenMeteoForecast
  return toForecastFromOpenMeteo(location, payload)
}

async function getOutlookSummaries(latitude: number, longitude: number) {
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' })
    const dayOfMonth = Number(today.slice(8, 10))
    const pastDays = Math.max(0, dayOfMonth - 1)
    const url = openMeteoUrl(latitude, longitude, {
      forecast_days: '16',
      past_days: String(pastDays),
    })
    const response = await fetch(url)
    if (!response.ok) return null
    const payload = (await response.json()) as OpenMeteoForecast
    return buildWeeklyAndMonthlySummaries(openMeteoDailyToDays(payload))
  } catch {
    return null
  }
}

export async function getForecast(input: {
  latitude: number
  longitude: number
  location: string
}): Promise<WeatherForecast> {
  const key = cacheKey(input.latitude, input.longitude)
  const cached = forecastCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  const fromOpenWeather = await getForecastOpenWeather(input.latitude, input.longitude, input.location)
  const data = fromOpenWeather ?? (await getForecastOpenMeteo(input.latitude, input.longitude, input.location))
  const outlook = await getOutlookSummaries(input.latitude, input.longitude)
  const withOutlook: WeatherForecast = {
    ...data,
    weekly:
      outlook?.weekly ??
      summarizeDays(data.days, 'Overall weekly', formatDayRange(data.days) || 'Next 7 days'),
    monthly: outlook?.monthly,
  }
  forecastCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, data: withOutlook })
  return withOutlook
}
