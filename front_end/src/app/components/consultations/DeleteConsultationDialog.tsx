import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

export function DeleteConsultationDialog({
  open,
  topic,
  deleting,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean
  topic?: string
  deleting: boolean
  error?: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Bricolage_Grotesque',Inter,sans-serif] font-bold text-[#10241A]">
            Delete conversation
          </DialogTitle>
          <DialogDescription>
            Messages, photos, videos, and voice notes will be removed. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {topic ? (
          <p className="text-sm text-[#10241A]">Delete “{topic}”?</p>
        ) : null}
        {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-[#5C6B60] hover:text-[#10241A]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="rounded-full bg-[#E5484D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c73e43] disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
