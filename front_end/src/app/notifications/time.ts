export function relativeTime(iso: string) {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'Just now'
  if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute)
    return `${mins}m ago`
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour)
    return `${hours}h ago`
  }
  if (diffMs < 7 * day) {
    const days = Math.floor(diffMs / day)
    return `${days}d ago`
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function absoluteTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
