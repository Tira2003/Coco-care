import { Sun, CloudRain, Cloud, CloudSun } from 'lucide-react'
import type { DiseaseReport, WeatherDay, WeatherIcon } from '@/types'

export function getDiseaseEmoji(disease: string): { emoji: string; bg: string } {
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

export function getMethodBadge(report: DiseaseReport): { label: string } {
  if (report.imageResult && report.symptomResult) {
    return { label: '⚡ Fusion' }
  }
  if (report.imageResult) {
    return { label: '📷 Leaf scan' }
  }
  return { label: '🧪 Symptoms' }
}

export function getStatusBadge(status: string, confidence: number) {
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

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function WeatherIconDisplay({ icon, className }: { icon: WeatherIcon; className?: string }) {
  const cls = className ?? 'w-7 h-7'
  if (icon === 'sun') return <Sun className={`${cls} text-[#F5A524]`} />
  if (icon === 'rain') return <CloudRain className={`${cls} text-[#3B82F6]`} />
  if (icon === 'cloud') return <Cloud className={`${cls} text-gray-400`} />
  return <CloudSun className={`${cls} text-[#60A5FA]`} />
}

export function getWeatherRisk(day: WeatherDay) {
  const rain = day.rainChance ?? day.rain ?? 0
  if (rain >= 50) return { label: 'High', className: 'bg-[#FDE7E8] text-[#B3261E]' }
  if (rain >= 25) return { label: 'Med', className: 'bg-[#FCF0DA] text-[#8A5A00]' }
  return { label: 'Low', className: 'bg-[#E1F3E8] text-[#1E7A44]' }
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return 'Good morning'
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon'
  }
  return 'Good evening'
}
