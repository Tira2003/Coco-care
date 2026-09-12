import type { DiseaseReport } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

export function ReportDetailDialog({
  report,
  open,
  onOpenChange,
  actions,
}: {
  report: DiseaseReport | null
  open: boolean
  onOpenChange: (open: boolean) => void
  actions?: React.ReactNode
}) {
  if (!report) return null

  const symptomEntries = report.symptoms
    ? Object.entries(report.symptoms)
        .filter(([, value]) => !(typeof value === 'string' && value.trim().length === 0))
        .map(([key, value]) => ({
          key,
          label: formatSymptomKey(key),
          value: formatSymptomValue(value),
        }))
    : []
  const farm = report.farm
  const farmer = report.farmer

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{report.finalResult ?? 'Disease report'}</DialogTitle>
          <DialogDescription>
            Full report details for {report.farmName} ({report.region})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report.status} />
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              Confidence {Math.round(report.confidence * 100)}%
            </span>
          </div>

          <section>
            <div className="text-gray-500 mb-1.5">Uploaded image</div>
            {report.imageUrl ? (
              report.imageUrl.startsWith('data:') || report.imageUrl.startsWith('http') ? (
                <img
                  src={report.imageUrl}
                  alt="Report attachment"
                  className="max-h-80 w-full rounded-xl border border-green-100 object-contain bg-gray-50"
                />
              ) : (
                <p className="text-gray-700 break-all rounded-xl border border-gray-100 bg-gray-50 p-3">
                  {report.imageUrl}
                </p>
              )
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-gray-500">
                No image uploaded
              </p>
            )}
          </section>

          <section>
            <div className="text-gray-500 mb-1.5">Farmer details</div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailField label="Name" value={farmer?.name} />
              <DetailField label="Username / NIC" value={farmer?.username} />
              <DetailField label="Mobile number" value={farmer?.phone} />
              <DetailField label="Email" value={farmer?.email} />
            </dl>
          </section>

          <section>
            <div className="text-gray-500 mb-1.5">Farm and location</div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailField label="Farm" value={farm?.name ?? report.farmName} />
              <DetailField label="Region / location" value={farm?.location ?? report.region} />
              <DetailField
                label="Coordinates"
                value={
                  farm
                    ? `${formatNumber(farm.latitude, 6)}, ${formatNumber(farm.longitude, 6)}`
                    : undefined
                }
              />
              <DetailField label="Acreage" value={farm ? `${farm.acreage}` : undefined} />
              <DetailField label="Tree count" value={farm ? `${farm.treeCount}` : undefined} />
              <DetailField label="Farm ID" value={report.farmId} />
            </dl>
          </section>

          <section>
            <div className="text-gray-500 mb-1.5">Diagnosis details</div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailField label="Final result" value={report.finalResult} />
              <DetailField label="Image result" value={report.imageResult} />
              <DetailField label="Symptom result" value={report.symptomResult} />
              <DetailField label="Confidence" value={`${Math.round(report.confidence * 100)}%`} />
              <DetailField label="Submitted" value={new Date(report.createdAt).toLocaleString()} />
              <DetailField label="Report ID" value={report.id} />
            </dl>
          </section>

          {report.advice && (
            <section>
              <div className="text-gray-500 mb-1.5">Advice</div>
              <p className="text-gray-900 bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">
                {report.advice}
              </p>
            </section>
          )}

          <section>
            <div className="text-gray-500 mb-1.5">Submitted symptoms</div>
            {symptomEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptomEntries.map((symptom) => (
                  <div
                    key={symptom.key}
                    className="rounded-lg bg-green-50 text-green-950 border border-green-100 px-3 py-2"
                  >
                    <div className="text-xs text-green-700">{symptom.label}</div>
                    <div className="font-medium">{symptom.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-gray-500">
                No symptoms submitted
              </p>
            )}
          </section>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailField label="Review status" value={report.status} />
            <DetailField label="Review comment" value={report.reviewComment} />
          </dl>

          {actions}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailField({ label, value }: { label: string; value?: string | number | null }) {
  const display = value == null ? '' : String(value)
  return (
    <div className="rounded-xl border border-green-100 bg-green-50/40 px-3 py-2">
      <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-gray-900 break-words">{display.trim() ? display : '—'}</dd>
    </div>
  )
}

function formatNumber(value: number, decimals: number) {
  return Number.isFinite(value) ? value.toFixed(decimals) : '—'
}

function formatSymptomKey(key: string) {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

function formatSymptomValue(value: string | boolean) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return value.trim() || '—'
}

function StatusBadge({ status }: { status: DiseaseReport['status'] }) {
  const styles =
    status === 'verified'
      ? 'bg-green-100 text-green-800'
      : status === 'pending'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-gray-100 text-gray-700'

  return (
    <span className={`px-2 py-1 rounded-full text-xs capitalize ${styles}`}>{status}</span>
  )
}
