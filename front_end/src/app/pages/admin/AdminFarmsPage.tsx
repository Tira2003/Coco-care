import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { adminApi } from '@/api/services'
import type { AdminFarm, DiseaseReport } from '@/types'
import { ReportDetailDialog } from './ReportDetailDialog'

export function AdminFarmsPage() {
  const [selectedFarm, setSelectedFarm] = useState<AdminFarm | null>(null)
  const [selectedReport, setSelectedReport] = useState<DiseaseReport | null>(null)

  const { data: farms = [], isLoading: farmsLoading } = useQuery({
    queryKey: ['admin', 'farms'],
    queryFn: adminApi.farms,
  })

  const { data: regions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ['admin', 'regions'],
    queryFn: adminApi.regionSummary,
  })

  const { data: farmReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['admin', 'farm-reports', selectedFarm?.id],
    queryFn: () => adminApi.farmReports(selectedFarm!.id),
    enabled: Boolean(selectedFarm),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Farms & Regions</h1>
        <p className="text-[#6b7c6b]">All registered farms and outbreak counts by region.</p>
      </div>

      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-green-100 bg-green-50/60">
          <h2 className="text-sm font-semibold text-[#1a2e1a]">Regional summary</h2>
        </div>
        {regionsLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#2d5f2e]" />
          </div>
        ) : regions.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No regional data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50/40 border-b border-green-100">
                <tr>
                  <th className="text-left p-4 text-gray-600">Region</th>
                  <th className="text-left p-4 text-gray-600">Pending</th>
                  <th className="text-left p-4 text-gray-600">Verified</th>
                  <th className="text-left p-4 text-gray-600">Rejected</th>
                  <th className="text-left p-4 text-gray-600">Total reports</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r) => (
                  <tr key={r.region} className="border-b border-gray-100">
                    <td className="p-4 text-gray-900">{r.region}</td>
                    <td className="p-4 text-amber-700">{r.pending}</td>
                    <td className="p-4 text-green-700">{r.verified}</td>
                    <td className="p-4 text-gray-700">{r.rejected}</td>
                    <td className="p-4 text-gray-900">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-green-100 bg-green-50/60">
          <h2 className="text-sm font-semibold text-[#1a2e1a]">All farms</h2>
        </div>
        {farmsLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#2d5f2e]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50/40 border-b border-green-100">
                <tr>
                  <th className="text-left p-4 text-gray-600">Farm</th>
                  <th className="text-left p-4 text-gray-600">Owner</th>
                  <th className="text-left p-4 text-gray-600">Location</th>
                  <th className="text-left p-4 text-gray-600">Acreage</th>
                  <th className="text-left p-4 text-gray-600">Trees</th>
                </tr>
              </thead>
              <tbody>
                {farms.map((f) => (
                  <tr
                    key={f.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedFarm(f)}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-green-50/70 ${
                      selectedFarm?.id === f.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="p-4 text-gray-900">{f.name}</td>
                    <td className="p-4 text-gray-700">
                      {f.ownerName} (@{f.ownerUsername})
                    </td>
                    <td className="p-4 text-gray-700">{f.location}</td>
                    <td className="p-4 text-gray-700">{f.acreage}</td>
                    <td className="p-4 text-gray-700">{f.treeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedFarm && (
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-green-100 bg-green-50/60 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1a2e1a]">
              Reports for {selectedFarm.name}
            </h2>
            <button
              type="button"
              onClick={() => setSelectedFarm(null)}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>
          {reportsLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#2d5f2e]" />
            </div>
          ) : farmReports.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No reports for this farm.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-green-50/40 border-b border-green-100">
                <tr>
                  <th className="text-left p-4 text-gray-600">Disease</th>
                  <th className="text-left p-4 text-gray-600">Status</th>
                  <th className="text-left p-4 text-gray-600">Confidence</th>
                  <th className="text-left p-4 text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {farmReports.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className="border-b border-gray-100 cursor-pointer hover:bg-green-50/70"
                  >
                    <td className="p-4">{r.finalResult ?? '—'}</td>
                    <td className="p-4 capitalize">{r.status}</td>
                    <td className="p-4">{Math.round(r.confidence * 100)}%</td>
                    <td className="p-4">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
