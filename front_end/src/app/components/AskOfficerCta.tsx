import { Link } from 'react-router'
import { UserRound } from 'lucide-react'

export function AskOfficerCta({
  reportId,
  farmId,
  topic = 'Scan follow-up',
}: {
  reportId?: string
  farmId?: string
  topic?: string
}) {
  const params = new URLSearchParams()
  if (reportId) params.set('reportId', reportId)
  if (farmId) params.set('farmId', farmId)
  if (topic) params.set('topic', topic)

  return (
    <Link
      to={`/app/consultations?${params.toString()}`}
      className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#123524] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0C281B]"
    >
      <UserRound className="h-4 w-4" />
      Ask a regional officer
    </Link>
  )
}
