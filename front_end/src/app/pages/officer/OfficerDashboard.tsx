import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList,
  MessageSquare,
  Map,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { officerConsultationsApi, reportsApi } from '@/api/services'
import { getTimeBasedGreeting } from '@/app/components/dashboard'
import { getDiseaseEmoji, getStatusBadge } from '@/app/components/dashboard/dashboardUtils'

export function OfficerDashboard() {
  const { user } = useAuth()
  const greeting = getTimeBasedGreeting()
  const firstName = (user?.name ?? 'Officer').split(' ')[0]
  const assignedRegion = user?.assignedRegion?.trim()
  const dateLabel = new Date()
    .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase()

  const { data: pendingReports = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['officer', 'pending-reports'],
    queryFn: reportsApi.pending,
    enabled: Boolean(assignedRegion),
  })

  const { data: verifiedReports = [] } = useQuery({
    queryKey: ['officer', 'verified-reports'],
    queryFn: reportsApi.verified,
  })

  const { data: threads = [] } = useQuery({
    queryKey: ['officer', 'consultations'],
    queryFn: officerConsultationsApi.list,
    enabled: Boolean(assignedRegion),
  })

  const needsReply = threads.filter((item) => item.inbox === 'needs_reply')
  const regionVerified = verifiedReports.filter(
    (report) => report.region.trim().toLowerCase() === (assignedRegion ?? '').toLowerCase(),
  ).length

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="lg:hidden space-y-1">
        <div className="text-[12px] font-bold text-[#8A9A8E] tracking-wider uppercase">{dateLabel}</div>
        <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[26px] font-extrabold text-[#123524] tracking-tight leading-tight">
          {greeting}, {firstName}
        </h1>
        <p className="text-[13.5px] text-[#5C6B60] leading-snug">
          Review farmer diagnoses in {assignedRegion || 'your district'} and keep consultations moving.
        </p>
      </div>

      <div className="hidden lg:block">
        <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-xl font-bold tracking-tight text-[#10241A] sm:text-2xl lg:text-3xl">
          {greeting}, {firstName}!
        </h1>
        <p className="mt-0.5 text-sm text-[#5C6B60]">
          {assignedRegion
            ? `Pending reviews, farmer messages, and verified outbreaks for ${assignedRegion}.`
            : 'Ask an admin to assign your district before you can review reports.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3.5">
        <StatCard label="Pending reviews" value={pendingReports.length} tone="amber" />
        <StatCard label="Need a reply" value={needsReply.length} tone="green" />
        <StatCard label="Verified here" value={regionVerified} tone="lime" />
        <StatCard label="Island confirmed" value={verifiedReports.length} tone="pine" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3.5">
        <QuickLink
          to="/officer/reports"
          title="Review queue"
          subtitle="Verify or reject"
          icon={ClipboardList}
          primary
        />
        <QuickLink
          to="/officer/consultations"
          title="Consultations"
          subtitle={`${needsReply.length} waiting`}
          icon={MessageSquare}
        />
        <QuickLink to="/officer/heatmap" title="Outbreak map" subtitle="Sri Lanka" icon={Map} />
        <QuickLink to="/officer/notifications" title="Inbox" subtitle="Alerts & notes" icon={Bell} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm lg:col-span-7 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              Waiting on you
            </h2>
            <Link
              to="/officer/reports"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#123524] hover:underline"
            >
              Open queue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {!assignedRegion ? (
            <p className="rounded-2xl bg-[#FCF0DA] px-4 py-3 text-sm text-[#8A5A00]">
              No region assigned yet. An admin needs to set your district before pending reports appear.
            </p>
          ) : pendingLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#123524]" />
            </div>
          ) : pendingReports.length === 0 ? (
            <div className="rounded-2xl bg-[#F6F7F2] px-4 py-8 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-[#1E7A44]" />
              <p className="text-sm font-semibold text-[#10241A]">Queue is clear</p>
              <p className="mt-1 text-xs text-[#5C6B60]">No pending diagnoses in {assignedRegion}.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingReports.slice(0, 5).map((report) => {
                const visual = getDiseaseEmoji(report.finalResult ?? '')
                const status = getStatusBadge(report.status, report.confidence)
                return (
                  <Link
                    key={report.id}
                    to="/officer/reports"
                    className="flex items-center gap-3 rounded-2xl border border-[#E6EADF] px-3 py-2.5 hover:bg-[#FBFDF8]"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${visual.bg}`}
                    >
                      {visual.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#10241A]">
                        {report.finalResult ?? 'Unknown disease'}
                      </p>
                      <p className="truncate text-xs text-[#5C6B60]">
                        {report.farmName} · {Math.round(report.confidence * 100)}%
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}>
                      {status.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm lg:col-span-5 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              Farmer messages
            </h2>
            <Link
              to="/officer/consultations"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#123524] hover:underline"
            >
              Open inbox <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {needsReply.length === 0 ? (
            <p className="rounded-2xl bg-[#F6F7F2] px-4 py-8 text-center text-sm text-[#5C6B60]">
              No farmers are waiting on a reply.
            </p>
          ) : (
            <div className="space-y-2">
              {needsReply.slice(0, 5).map((thread) => (
                <Link
                  key={thread.id}
                  to="/officer/consultations"
                  className="block rounded-2xl border border-[#E6EADF] px-3 py-2.5 hover:bg-[#FBFDF8]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-[#10241A]">{thread.farmerName}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FCF0DA] px-2 py-0.5 text-[10px] font-bold text-[#8A5A00]">
                      <Clock className="h-3 w-3" />
                      Reply
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#5C6B60]">{thread.lastMessage || thread.topic}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'amber' | 'green' | 'lime' | 'pine'
}) {
  const tones = {
    amber: 'bg-[#FCF0DA] text-[#8A5A00]',
    green: 'bg-[#DDF2EA] text-[#147A5C]',
    lime: 'bg-[#EDF3E0] text-[#123524]',
    pine: 'bg-[#123524] text-white',
  }
  return (
    <div className={`rounded-2xl p-3.5 shadow-sm sm:p-4 ${tones[tone]}`}>
      <div className="font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-extrabold">{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold opacity-80 sm:text-xs">{label}</div>
    </div>
  )
}

function QuickLink({
  to,
  title,
  subtitle,
  icon: Icon,
  primary = false,
}: {
  to: string
  title: string
  subtitle: string
  icon: typeof ClipboardList
  primary?: boolean
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm sm:p-4 ${
        primary
          ? 'border-[#123524] bg-[#123524] text-white hover:bg-[#0C281B]'
          : 'border-[#E6EADF] bg-white text-[#10241A] hover:bg-[#FBFDF8]'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          primary ? 'bg-[rgba(201,241,105,.16)] text-[#C9F169]' : 'bg-[#EDF3E0] text-[#123524]'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <b className="block font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold">{title}</b>
        <span className={`block truncate text-xs ${primary ? 'text-[#AEC0A6]' : 'text-[#5C6B60]'}`}>
          {subtitle}
        </span>
      </div>
    </Link>
  )
}
