import type { ComponentType } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import {
  Users,
  FileWarning,
  MapPin,
  Loader2,
  ChevronRight,
  Bell,
  Activity,
  Shield,
  Sprout,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { adminApi } from '@/api/services'

const quickActions = [
  {
    to: '/admin/users',
    label: 'Manage users',
    description: 'Create, edit, and deactivate accounts',
    icon: Users,
    color: 'from-emerald-500 to-[#2d5f2e]',
  },
  {
    to: '/admin/reports',
    label: 'Review reports',
    description: 'Verify pending disease submissions',
    icon: FileWarning,
    color: 'from-amber-500 to-orange-600',
  },
  {
    to: '/admin/farms',
    label: 'Farms & regions',
    description: 'View estates and outbreak hotspots',
    icon: Sprout,
    color: 'from-lime-500 to-green-700',
  },
  {
    to: '/admin/notifications',
    label: 'Broadcast alerts',
    description: 'Send messages to farmers or officers',
    icon: Bell,
    color: 'from-sky-500 to-blue-600',
  },
  {
    to: '/admin/system',
    label: 'System health',
    description: 'Database, BERT, Groq, and knowledge base',
    icon: Activity,
    color: 'from-violet-500 to-purple-600',
  },
]

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  })

  const { data: health } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: adminApi.health,
    staleTime: 60_000,
  })

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  const allSystemsOk =
    health?.database && health?.geminiEmbedding && health?.groq && (health?.knowledgeChunks ?? 0) > 0

  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a3d1a] via-[#2d5f2e] to-[#3d7a3f] px-6 py-8 sm:px-8 sm:py-10 text-white shadow-lg">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm mb-4">
              <Shield className="w-3.5 h-3.5" />
              Admin control center
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              CocoCare Admin Dashboard
            </h1>
            <p className="text-emerald-100/90 max-w-lg text-sm sm:text-base">
              Monitor platform activity, manage users, and keep coconut disease reporting
              running smoothly.
            </p>
          </div>
          {health && (
            <div
              className={`shrink-0 rounded-2xl px-4 py-3 backdrop-blur-md border ${
                allSystemsOk
                  ? 'bg-white/15 border-white/20'
                  : 'bg-amber-500/20 border-amber-300/30'
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-emerald-100/80 mb-1">
                Platform status
              </p>
              <p className="font-semibold flex items-center gap-2">
                {allSystemsOk ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    All systems operational
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-amber-200" />
                    Some services need attention
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1a2e1a]">Overview</h2>
            <span className="text-xs text-gray-500">Live from platform data</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatLink
              to="/admin/users"
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              gradient="from-emerald-500 to-teal-600"
              accent="bg-emerald-50 text-emerald-700"
            />
            <StatLink
              to="/admin/reports?status=pending"
              icon={FileWarning}
              label="Pending Reports"
              value={stats.pendingReports}
              gradient="from-amber-400 to-orange-500"
              accent="bg-amber-50 text-amber-700"
              highlight={stats.pendingReports > 0}
            />
            <StatLink
              to="/admin/reports?status=verified"
              icon={MapPin}
              label="Verified Outbreaks"
              value={stats.verifiedOutbreaks}
              gradient="from-green-600 to-[#2d5f2e]"
              accent="bg-green-50 text-green-700"
            />
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold text-[#1a2e1a] mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-4 rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <ChevronRight className="w-4 h-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#2d5f2e]" />
                </div>
                <p className="mt-1 text-sm text-gray-500 leading-snug">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Knowledge snapshot */}
      {health && (
        <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a2e1a] mb-4">Knowledge base</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MiniStat label="Documents" value={health.knowledgeDocuments} />
            <MiniStat label="RAG chunks" value={health.knowledgeChunks} />
            <MiniStat label="Database" value={health.database ? 'Online' : 'Offline'} ok={health.database} />
            <MiniStat label="AI pipeline" value={health.groq && health.geminiEmbedding ? 'Ready' : 'Partial'} ok={health.groq && health.geminiEmbedding} />
          </div>
        </section>
      )}
    </div>
  )
}

function StatLink({
  to,
  icon: Icon,
  label,
  value,
  gradient,
  accent,
  highlight,
}: {
  to: string
  icon: ComponentType<{ className?: string }>
  label: string
  value: number
  gradient: string
  accent: string
  highlight?: boolean
}) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
        highlight ? 'border-amber-200 ring-1 ring-amber-100' : 'border-green-100 hover:border-green-200'
      }`}
    >
      <div className={`absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] group-hover:opacity-[0.12] transition-opacity`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${accent}`}>
            View
          </span>
        </div>
        <div className="text-4xl font-semibold text-gray-900 tracking-tight mb-1">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </Link>
  )
}

function MiniStat({
  label,
  value,
  ok,
}: {
  label: string
  value: number | string
  ok?: boolean
}) {
  const isBool = typeof value === 'string'
  return (
    <div className="rounded-xl bg-green-50/60 border border-green-100/80 px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`text-lg font-semibold ${
          isBool ? (ok ? 'text-emerald-700' : 'text-amber-700') : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
