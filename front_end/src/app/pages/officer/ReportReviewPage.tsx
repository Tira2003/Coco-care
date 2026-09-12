import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  AlertTriangle,
  FileWarning,
  Globe,
  Clock,
  Eye,
} from 'lucide-react'
import { useState } from 'react'
import { reportsApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import type { DiseaseReport } from '@/types'
import { ReportDetailDialog } from '../admin/ReportDetailDialog'

type Tab = 'pending' | 'confirmed'

function ReportMeta({ report }: { report: DiseaseReport }) {
  return (
    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
      <div className="rounded-lg bg-gray-50 px-3 py-2">
        <div className="text-xs text-gray-500">Image result</div>
        <div className="text-gray-900">{report.imageResult ?? '—'}</div>
      </div>
      <div className="rounded-lg bg-gray-50 px-3 py-2">
        <div className="text-xs text-gray-500">Symptom result</div>
        <div className="text-gray-900">{report.symptomResult ?? '—'}</div>
      </div>
      <div className="rounded-lg bg-gray-50 px-3 py-2">
        <div className="text-xs text-gray-500">Confidence</div>
        <div className="text-gray-900">{Math.round(report.confidence * 100)}%</div>
      </div>
    </div>
  )
}

export function ReportReviewPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('pending')
  const [comment, setComment] = useState<Record<string, string>>({})
  const [selectedReport, setSelectedReport] = useState<DiseaseReport | null>(null)
  const assignedRegion = user?.assignedRegion?.trim()

  const { data: pendingReports = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['officer', 'pending-reports'],
    queryFn: reportsApi.pending,
    enabled: Boolean(assignedRegion),
  })

  const { data: confirmedReports = [], isLoading: confirmedLoading } = useQuery({
    queryKey: ['officer', 'verified-reports'],
    queryFn: reportsApi.verified,
    enabled: tab === 'confirmed',
  })

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      reviewComment,
    }: {
      id: string
      action: 'verify' | 'reject'
      reviewComment?: string
    }) => reportsApi.review(id, { action, comment: reviewComment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer', 'pending-reports'] })
      queryClient.invalidateQueries({ queryKey: ['officer', 'verified-reports'] })
    },
  })

  const isLoading = tab === 'pending' ? pendingLoading : confirmedLoading

  if (tab === 'pending' && pendingLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a3d1a] via-[#2d5f2e] to-[#3d7a3f] px-6 py-8 sm:px-8 text-white shadow-lg">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm mb-4">
              <FileWarning className="w-3.5 h-3.5" />
              Field verification
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Officer Report Review
            </h1>
            <p className="text-emerald-100/90 max-w-lg text-sm sm:text-base">
              Review pending reports in your region and browse confirmed outbreaks nationwide.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/15 border border-white/20 px-4 py-3 backdrop-blur-md">
            <p className="text-xs uppercase tracking-wide text-emerald-100/80 mb-1">
              {tab === 'pending' ? 'Pending in queue' : 'Confirmed nationwide'}
            </p>
            <p className="text-2xl font-semibold">
              {tab === 'pending' ? pendingReports.length : confirmedReports.length}
            </p>
          </div>
        </div>
      </section>

      <div className="flex gap-2 rounded-2xl border border-green-100 bg-white p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'pending'
              ? 'bg-[#2d5f2e] text-white shadow-sm'
              : 'text-gray-600 hover:bg-green-50 hover:text-[#2d5f2e]'
          }`}
        >
          <Clock className="h-4 w-4" />
          Pending
          {assignedRegion ? (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                tab === 'pending' ? 'bg-white/20' : 'bg-green-100 text-[#2d5f2e]'
              }`}
            >
              {pendingReports.length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab('confirmed')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'confirmed'
              ? 'bg-[#2d5f2e] text-white shadow-sm'
              : 'text-gray-600 hover:bg-green-50 hover:text-[#2d5f2e]'
          }`}
        >
          <Globe className="h-4 w-4" />
          Confirmed
        </button>
      </div>

      {tab === 'pending' ? (
        <>
          {!assignedRegion ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-600" />
              <h2 className="text-lg font-semibold text-amber-900 mb-2">No region assigned</h2>
              <p className="text-sm text-amber-800 max-w-md mx-auto">
                Contact your system administrator to assign a region before you can review pending
                disease reports. You can still view confirmed reports in the other tab.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#2d5f2e]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Your assigned region</p>
                <p className="text-lg text-[#2d5f2e] font-semibold">{assignedRegion}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Only pending reports from farms in this region are shown here.
                </p>
              </div>
            </div>
          )}

          {assignedRegion && pendingReports.length === 0 ? (
            <div className="rounded-2xl border border-green-100 bg-white p-12 text-center shadow-sm">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">All caught up</h2>
              <p className="text-sm text-gray-500">
                No pending reports in {assignedRegion} at the moment.
              </p>
            </div>
          ) : null}

          {assignedRegion && pendingReports.length > 0 ? (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <article
                  key={report.id}
                  className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 p-6 sm:flex-row">
                    {report.imageUrl ? (
                      <div className="shrink-0">
                        <img
                          src={report.imageUrl}
                          alt="Report"
                          className="h-32 w-full rounded-xl object-cover sm:h-28 sm:w-36"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {report.finalResult ?? 'Unknown disease'}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {report.farmName} · {report.region} ·{' '}
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium capitalize text-amber-800">
                          {report.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <ReportMeta report={report} />
                      </div>

                      <div className="mb-4">
                        <label className="mb-1 block text-sm text-gray-600">Review comment</label>
                        <textarea
                          value={comment[report.id] ?? ''}
                          onChange={(e) => setComment({ ...comment, [report.id]: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
                          rows={2}
                          placeholder="Optional officer notes..."
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(report)}
                          className="flex items-center gap-2 rounded-xl border border-green-200 px-4 py-2 text-sm text-[#2d5f2e] hover:bg-green-50"
                        >
                          <Eye className="h-4 w-4" />
                          View details
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            reviewMutation.mutate({
                              id: report.id,
                              action: 'verify',
                              reviewComment: comment[report.id],
                            })
                          }
                          disabled={reviewMutation.isPending}
                          className="flex items-center gap-2 rounded-xl bg-[#2d5f2e] px-4 py-2 text-sm text-white hover:bg-[#1a2e1a] disabled:opacity-60"
                        >
                          {reviewMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            reviewMutation.mutate({
                              id: report.id,
                              action: 'reject',
                              reviewComment: comment[report.id],
                            })
                          }
                          disabled={reviewMutation.isPending}
                          className="flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#2d5f2e]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Nationwide confirmed outbreaks</p>
              <p className="text-xs text-gray-500 mt-1">
                Verified disease reports from all regions — read-only for situational awareness.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
            </div>
          ) : confirmedReports.length === 0 ? (
            <div className="rounded-2xl border border-green-100 bg-white p-12 text-center shadow-sm">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No confirmed reports yet</h2>
              <p className="text-sm text-gray-500">
                Verified outbreaks will appear here once officers confirm pending cases.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {confirmedReports.map((report) => (
                <article
                  key={report.id}
                  className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 p-6 sm:flex-row">
                    {report.imageUrl ? (
                      <div className="shrink-0">
                        <img
                          src={report.imageUrl}
                          alt="Report"
                          className="h-32 w-full rounded-xl object-cover sm:h-28 sm:w-36"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {report.finalResult ?? 'Unknown disease'}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {report.farmName} · {report.region} ·{' '}
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium capitalize text-green-800">
                          {report.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <ReportMeta report={report} />
                      </div>

                      {report.advice ? (
                        <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-gray-700">
                          <span className="font-medium text-gray-900">Advice: </span>
                          {report.advice}
                        </div>
                      ) : null}

                      {report.reviewComment ? (
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                          <span className="font-medium text-gray-800">Review note: </span>
                          {report.reviewComment}
                        </div>
                      ) : null}

                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(report)}
                          className="inline-flex items-center gap-2 rounded-xl border border-green-200 px-4 py-2 text-sm text-[#2d5f2e] hover:bg-green-50"
                        >
                          <Eye className="h-4 w-4" />
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      <ReportDetailDialog
        report={selectedReport}
        open={selectedReport !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedReport(null)
        }}
      />
    </div>
  )
}
