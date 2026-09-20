import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  AlertTriangle,
  Globe,
  Clock,
  Eye,
} from 'lucide-react'
import { useState } from 'react'
import { reportsApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import type { DiseaseReport } from '@/types'
import { ReportDetailDialog } from '../admin/ReportDetailDialog'
import { getStatusBadge } from '@/app/components/dashboard/dashboardUtils'

type Tab = 'pending' | 'confirmed'

function ReportMeta({ report }: { report: DiseaseReport }) {
  return (
    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
      <div className="rounded-2xl bg-[#F6F7F2] px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#5C6B60]">Image</div>
        <div className="text-[#10241A]">{report.imageResult ?? '—'}</div>
      </div>
      <div className="rounded-2xl bg-[#F6F7F2] px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#5C6B60]">Symptoms</div>
        <div className="text-[#10241A]">{report.symptomResult ?? '—'}</div>
      </div>
      <div className="rounded-2xl bg-[#F6F7F2] px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#5C6B60]">Confidence</div>
        <div className="text-[#10241A]">{Math.round(report.confidence * 100)}%</div>
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
      queryClient.invalidateQueries({ queryKey: ['disease-map'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const isLoading = tab === 'pending' ? pendingLoading : confirmedLoading

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold tracking-tight text-[#10241A] sm:text-3xl">
          Report review
        </h1>
        <p className="mt-1 text-sm text-[#5C6B60]">
          Check the photo, symptoms, and AI result, then verify or reject. Verified cases alert nearby farms.
        </p>
      </div>

      <div className="flex gap-1 rounded-full border border-[#E6EADF] bg-white p-1">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            tab === 'pending' ? 'bg-[#123524] text-white' : 'text-[#5C6B60] hover:bg-[#F1F5EA]'
          }`}
        >
          <Clock className="h-4 w-4" />
          Pending
          {assignedRegion ? (
            <span className={`rounded-full px-2 py-0.5 text-xs ${tab === 'pending' ? 'bg-white/20' : 'bg-[#EDF3E0] text-[#123524]'}`}>
              {pendingReports.length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab('confirmed')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            tab === 'confirmed' ? 'bg-[#123524] text-white' : 'text-[#5C6B60] hover:bg-[#F1F5EA]'
          }`}
        >
          <Globe className="h-4 w-4" />
          Confirmed
        </button>
      </div>

      {tab === 'pending' ? (
        <>
          {!assignedRegion ? (
            <div className="rounded-2xl border border-[#F5A524]/40 bg-[#FCF0DA] p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-[#8A5A00]" />
              <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
                No region assigned
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#8A5A00]">
                Ask an administrator to assign your district before pending reports can reach this queue.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6B60]">Your district</p>
                <p className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
                  {assignedRegion}
                </p>
              </div>
            </div>
          )}

          {assignedRegion && pendingLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
            </div>
          ) : null}

          {assignedRegion && !pendingLoading && pendingReports.length === 0 ? (
            <div className="rounded-2xl border border-[#E6EADF] bg-white p-12 text-center shadow-sm">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-[#1E7A44]" />
              <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
                All caught up
              </h2>
              <p className="mt-1 text-sm text-[#5C6B60]">No pending reports in {assignedRegion}.</p>
            </div>
          ) : null}

          {assignedRegion && pendingReports.length > 0 ? (
            <div className="space-y-3">
              {pendingReports.map((report) => {
                const status = getStatusBadge(report.status, report.confidence)
                return (
                  <article
                    key={report.id}
                    className="overflow-hidden rounded-2xl border border-[#E6EADF] bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt=""
                          className="h-36 w-full rounded-2xl object-cover sm:h-28 sm:w-36"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
                              {report.finalResult ?? 'Unknown disease'}
                            </h2>
                            <p className="text-sm text-[#5C6B60]">
                              {report.farmName} · {report.region} ·{' '}
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <ReportMeta report={report} />
                        <label className="block">
                          <span className="mb-1 block text-sm font-semibold text-[#10241A]">
                            Advice for the farmer
                          </span>
                          <textarea
                            value={comment[report.id] ?? ''}
                            onChange={(e) => setComment({ ...comment, [report.id]: e.target.value })}
                            className="w-full rounded-2xl border border-[#E6EADF] bg-[#F6F7F2] px-3 py-2 text-sm text-[#10241A] outline-none focus:border-[#123524] focus:bg-white"
                            rows={2}
                            placeholder="Optional note. This is sent with a verify."
                          />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(report)}
                            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E6EADF] px-4 text-sm font-semibold text-[#123524] hover:bg-[#F1F5EA]"
                          >
                            <Eye className="h-4 w-4" />
                            Details
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
                            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#123524] px-4 text-sm font-semibold text-white hover:bg-[#0C281B] disabled:opacity-60"
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
                            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E5484D]/30 px-4 text-sm font-semibold text-[#E5484D] hover:bg-[#FFF1F2] disabled:opacity-60"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : null}
        </>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
        </div>
      ) : confirmedReports.length === 0 ? (
        <div className="rounded-2xl border border-[#E6EADF] bg-white p-12 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-3 h-10 w-10 text-[#8A9A8E]" />
          <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
            No confirmed reports yet
          </h2>
          <p className="mt-1 text-sm text-[#5C6B60]">Verified outbreaks will appear here for situational awareness.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {confirmedReports.map((report) => {
            const status = getStatusBadge(report.status, report.confidence)
            return (
              <article key={report.id} className="overflow-hidden rounded-2xl border border-[#E6EADF] bg-white shadow-sm">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                  {report.imageUrl ? (
                    <img
                      src={report.imageUrl}
                      alt=""
                      className="h-36 w-full rounded-2xl object-cover sm:h-28 sm:w-36"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
                          {report.finalResult ?? 'Unknown disease'}
                        </h2>
                        <p className="text-sm text-[#5C6B60]">
                          {report.farmName} · {report.region} · {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <ReportMeta report={report} />
                    {report.advice ? (
                      <p className="rounded-2xl bg-[#EDF3E0] px-3 py-2 text-sm text-[#10241A]">
                        <span className="font-semibold">Advice: </span>
                        {report.advice}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E6EADF] px-4 text-sm font-semibold text-[#123524] hover:bg-[#F1F5EA]"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
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
