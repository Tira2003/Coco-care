import {
  mapWeatherIcon,
  mapWmoIcon,
  wmoDescription,
  buildFarmingTip,
  summarizeDays,
} from '../src/modules/weather/weather.mapper.js'
import type { WeatherDay } from '../src/types/index.js'

describe('weather mapper', () => {
  it('maps OpenWeather icon codes', () => {
    expect(mapWeatherIcon('01d')).toBe('sun')
    expect(mapWeatherIcon('02n')).toBe('partly')
    expect(mapWeatherIcon('10d')).toBe('rain')
    expect(mapWeatherIcon('04d')).toBe('cloud')
  })

  it('warns against spraying in heavy rain', () => {
    expect(
      buildFarmingTip({ rainChance: 70, windSpeed: 8, humidity: 70 }),
    ).toMatch(/skip spraying/i)
  })

  it('recommends a morning spray window in calm dry weather', () => {
    expect(
      buildFarmingTip({ rainChance: 10, windSpeed: 8, humidity: 70 }),
    ).toMatch(/Good spray window/i)
  })

  it('maps WMO weather codes', () => {
    expect(mapWmoIcon(0)).toBe('sun')
    expect(mapWmoIcon(2)).toBe('partly')
    expect(mapWmoIcon(61)).toBe('rain')
    expect(wmoDescription(0)).toBe('clear sky')
  })

  it('summarises a wet week for spraying advice', () => {
    const days: WeatherDay[] = [
      day({ day: 'Mon', date: '2026-09-14', rainChance: 70, rainMm: 12, humidity: 88, windSpeed: 10 }),
      day({ day: 'Tue', date: '2026-09-15', rainChance: 65, rainMm: 8, humidity: 86, windSpeed: 12 }),
      day({ day: 'Wed', date: '2026-09-16', rainChance: 80, rainMm: 18, humidity: 90, windSpeed: 9 }),
    ]
    const summary = summarizeDays(days, 'This week', '14–16 Sep')
    expect(summary?.totalRainMm).toBe(38)
    expect(summary?.rainDays).toBe(3)
    expect(summary?.headline).toMatch(/skip spraying/i)
  })
})

function day(partial: Partial<WeatherDay> & Pick<WeatherDay, 'day' | 'date'>): WeatherDay {
  return {
    high: 31,
    low: 24,
    rainChance: 10,
    rainMm: 0,
    humidity: 70,
    windSpeed: 8,
    windDirection: 'SW',
    feelsLike: 33,
    description: 'partly cloudy',
    icon: 'partly',
    ...partial,
  }
}
