import { useState, useEffect, useRef } from 'react'

interface CounterProps {
  target: number
  suffix?: string
  duration?: number
}

function Counter({ target, suffix = '', duration = 1500 }: CounterProps) {
  const [count, setCount] = useState(0)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let startTimestamp: number | null = null
    let frameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      }
    }
    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [inView, target, duration])

  return (
    <div ref={ref} className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#123524] font-['Bricolage_Grotesque',sans-serif]">
      {count.toLocaleString()}
      {suffix}
    </div>
  )
}

export function StatsSection() {
  const stats = [
    { target: 25000, suffix: '+', label: 'Palms scanned' },
    { target: 12, suffix: '', label: 'Diseases detected' },
    { target: 94, suffix: '%', label: 'Fusion accuracy' },
    { target: 150, suffix: '+', label: 'Officers verifying' },
  ]

  return (
    <section className="py-12 border-t border-[#E4E8DC] bg-white/40">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div key={item.label} className="text-center p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
            <Counter target={item.target} suffix={item.suffix} />
            <div className="mt-1 text-sm font-medium text-[#5C6B60]">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
