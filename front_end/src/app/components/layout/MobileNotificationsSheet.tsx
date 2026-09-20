import { Link } from 'react-router'
import { X, Bell, CheckCheck } from 'lucide-react'
import type { InboxNotification } from '@/types'
import { NotificationCard } from '@/app/notifications/NotificationCard'

interface MobileNotificationsSheetProps {
  isOpen: boolean
  onClose: () => void
  notifications: InboxNotification[]
  unreadAlertsCount: number
  onMarkRead: (item: InboxNotification) => void
  onMarkAllRead: () => Promise<void>
  onDismiss: (item: InboxNotification) => void
  inboxHref?: string
}

export function MobileNotificationsSheet({
  isOpen,
  onClose,
  notifications,
  unreadAlertsCount,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  inboxHref = '/app/notifications',
}: MobileNotificationsSheetProps) {
  if (!isOpen) return null
  const preview = notifications.slice(0, 8)

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-t-[32px] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.18)] max-w-[480px] w-full mx-auto animate-in slide-in-from-bottom duration-300 z-10">
        <div className="w-10 h-1 bg-[#E2E6DC] rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mt-1 mb-3">
          <div>
            <h3 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[20px] font-extrabold text-[#123524]">
              Notifications
            </h3>
            <p className="text-[11px] text-[#5C6B60]">
              {unreadAlertsCount > 0 ? `${unreadAlertsCount} unread` : 'You are caught up'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadAlertsCount > 0 ? (
              <button
                type="button"
                onClick={() => void onMarkAllRead()}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2E5A27] hover:underline cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#F4F6F0] hover:bg-[#EAEFE5] text-[#55655A] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {preview.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-[#EDF3E0] text-[#123524] flex items-center justify-center mx-auto mb-2">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-[14px] font-bold text-[#123524]">All caught up!</div>
              <p className="text-[12px] text-[#5C6B60] mt-0.5">
                Outbreaks, diagnosis updates, and officer replies will appear here.
              </p>
            </div>
          ) : (
            preview.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                compact
                onOpen={(n) => {
                  onMarkRead(n)
                  onClose()
                }}
                onDismiss={onDismiss}
              />
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#F0F3EB] text-center">
          <Link
            to={inboxHref}
            onClick={onClose}
            className="text-xs font-bold text-[#123524] hover:underline"
          >
            View all notifications & history →
          </Link>
        </div>
      </div>
    </div>
  )
}
