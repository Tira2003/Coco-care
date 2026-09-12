import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { adminApi } from '@/api/services'
import type { DiseaseReport } from '@/types'
import { ReportDetailDialog } from './ReportDetailDialog'

export function AdminReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') ?? '') as '' | 'pending' | 'verified' | 'rejected'
  const [region, setRegion] = useState('')
  const [disease, setDisease] = useState('')
  const [selected, setSelected] = useState<DiseaseReport | null>(null)
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()

  const filters = useMemo(
    () => ({
      status: status || undefined,
      region: region || undefined,
      disease: disease || undefined,
    }),
    [status, region, disease],
  )

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin', 'reports', filters],
    queryFn: () => adminApi.reports(filters),
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
    }) => adminApi.reviewReport(id, { action, comment: reviewComment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setSelected(null)
      setComment('')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Reports</h1>
        <p className="text-[#6b7c6b]">Filter disease reports and verify or reject pending cases.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => {
            const value = e.target.value
            if (value) setSearchParams({ status: value })
            else setSearchParams({})
          }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Filter by region"
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
        />
        <input
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
          placeholder="Filter by disease"
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
          </div>
        ) : reports.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No reports match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 border-b border-green-100">
                <tr>
                  <th className="text-left p-4 text-gray-600">Disease</th>
                  <th className="text-left p-4 text-gray-600">Farm</th>
                  <th className="text-left p-4 text-gray-600">Region</th>
                  <th className="text-left p-4 text-gray-600">Confidence</th>
                  <th className="text-left p-4 text-gray-600">Status</th>
                  <th className="text-left p-4 text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelected(r)
                      setComment('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(r)
                        setComment('')
                      }
                    }}
                    className="border-b border-gray-100 cursor-pointer hover:bg-green-50/70"
                  >
                    <td className="p-4 text-gray-900">{r.finalResult ?? '—'}</td>
                    <td className="p-4 text-gray-700">{r.farmName}</td>
                    <td className="p-4 text-gray-700">{r.region}</td>
                    <td className="p-4 text-gray-700">{Math.round(r.confidence * 100)}%</td>
                    <td className="p-4 capitalize">{r.status}</td>
                    <td className="p-4 text-gray-700">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReportDetailDialog
        report={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        actions={
          selected?.status === 'pending' ? (
            <div className="space-y-3 pt-2 border-t border-green-100">
              <label className="block text-sm">
                <span className="text-gray-600">Review comment</span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Optional notes"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={reviewMutation.isPending}
                  onClick={() =>
                    reviewMutation.mutate({
                      id: selected.id,
                      action: 'verify',
                      reviewComment: comment,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d5f2e] text-white text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify
                </button>
                <button
                  type="button"
                  disabled={reviewMutation.isPending}
                  onClick={() =>
                    reviewMutation.mutate({
                      id: selected.id,
                      action: 'reject',
                      reviewComment: comment,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-700 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ) : undefined
        }
      />
    </div>
  )
}
