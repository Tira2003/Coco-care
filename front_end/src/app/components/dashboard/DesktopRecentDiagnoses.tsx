import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import type { DiseaseReport } from '@/types'
import { getDiseaseEmoji, getStatusBadge, getMethodBadge, formatDate } from './dashboardUtils'

interface DesktopRecentDiagnosesProps {
  reports: DiseaseReport[]
}

export function DesktopRecentDiagnoses({ reports }: DesktopRecentDiagnosesProps) {
  return (
    <div className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-[0_1px_2px_rgba(16,36,26,.04),0_4px_12px_rgba(16,36,26,.05)] sm:rounded-[20px] sm:p-5 lg:col-span-8 lg:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
        <div>
          <h3 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-base font-bold text-[#10241A] sm:text-lg">
            Recent Diagnoses
          </h3>
          <span className="text-[10px] text-[#5C6B60] sm:text-xs">
            Latest AI & officer-reviewed reports
          </span>
        </div>
        <Link
          to="/app/disease-detection"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E6EADF] px-3 py-1.5 text-[11px] font-semibold text-[#10241A] transition-colors hover:border-[#5C6B60] hover:bg-[#F6F7F2] sm:px-3.5 sm:text-xs"
        >
          New diagnosis
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E6EADF] py-10 text-center sm:py-12">
          <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF3E0] text-xl">
            🌴
          </span>
          <p className="text-sm font-medium text-[#10241A]">No diagnosis reports yet</p>
          <p className="mt-1 text-[11px] text-[#5C6B60] sm:text-xs">
            Run an AI leaf scan or complete a symptom questionnaire.
          </p>
          <Link
            to="/app/disease-detection"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#123524] hover:underline"
          >
            Start first diagnosis <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table — hidden on mobile */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E6EADF] text-[11px] font-bold uppercase tracking-wider text-[#5C6B60]">
                  <th className="pb-2.5 pt-1">Disease</th>
                  <th className="pb-2.5 pt-1">Date</th>
                  <th className="pb-2.5 pt-1">Method</th>
                  <th className="pb-2.5 pt-1">Confidence</th>
                  <th className="pb-2.5 pt-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 5).map((r) => {
                  const diseaseName = r.finalResult ?? r.imageResult ?? r.symptomResult ?? 'Undetermined'
                  const { emoji, bg } = getDiseaseEmoji(diseaseName)
                  const { label: methodLabel } = getMethodBadge(r)
                  const confidencePct = Math.round(r.confidence * 100)
                  const statusBadge = getStatusBadge(r.status, r.confidence)

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-[#E6EADF] transition-colors last:border-b-0 hover:bg-[#F6F7F2]/60"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${bg}`}>
                            {emoji}
                          </span>
                          <div className="min-w-0 max-w-[200px] sm:max-w-[240px]">
                            <b className="block truncate font-semibold text-[#10241A]">{diseaseName}</b>
                            <span className="block truncate text-[11px] text-[#5C6B60]">
                              {r.farmName} · RD-{r.id.slice(-4)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 whitespace-nowrap text-xs text-[#5C6B60]">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-[#EDF3E0] px-2 py-0.5 text-[11px] font-semibold text-[#2E4A38]">
                          {methodLabel}
                        </span>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <div className="min-w-[100px]">
                          <b className="text-xs font-bold text-[#10241A]">{confidencePct}%</b>
                          <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-[#E6EADF]">
                            <div
                              className={`h-full rounded-full ${confidencePct < 70 ? 'bg-[#F5A524]' : 'bg-[#7FA81B]'}`}
                              style={{ width: `${confidencePct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list — visible only on mobile */}
          <div className="space-y-2.5 sm:hidden">
            {reports.slice(0, 5).map((r) => {
              const diseaseName = r.finalResult ?? r.imageResult ?? r.symptomResult ?? 'Undetermined'
              const { emoji, bg } = getDiseaseEmoji(diseaseName)
              const { label: methodLabel } = getMethodBadge(r)
              const confidencePct = Math.round(r.confidence * 100)
              const statusBadge = getStatusBadge(r.status, r.confidence)

              return (
                <div
                  key={r.id}
                  className="flex items-start gap-3 rounded-2xl border border-[#E6EADF] p-3 transition-colors active:bg-[#F6F7F2]/60"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${bg}`}>
                    {emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <b className="block truncate text-[13px] font-semibold text-[#10241A]">{diseaseName}</b>
                        <span className="block truncate text-[10px] text-[#5C6B60]">
                          {r.farmName} · {formatDate(r.createdAt)}
                        </span>
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-[#EDF3E0] px-2 py-0.5 text-[10px] font-semibold text-[#2E4A38]">
                        {methodLabel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[#E6EADF]">
                          <div
                            className={`h-full rounded-full ${confidencePct < 70 ? 'bg-[#F5A524]' : 'bg-[#7FA81B]'}`}
                            style={{ width: `${confidencePct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#10241A] tabular-nums">{confidencePct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
