export function toPercentageNumber(value: number): number {
  if (!Number.isFinite(value)) return 0
  const normalized = value <= 1 ? value * 100 : value
  return Math.min(Math.max(normalized, 0), 100)
}

export function formatPercentage(value: number): string {
  const clamped = toPercentageNumber(value)
  return clamped.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}
