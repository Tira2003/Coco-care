import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bell, CheckCheck } from 'lucide-react'
import type { InboxNotification } from '@/types'
import { NotificationCard } from '@/app/notifications/NotificationCard'

interface DesktopHeaderProps {
  isScrolled: boolean
  unreadAlertsCount: number
  initials: string
  userName?: string
  notifications: InboxNotification[]
  onMarkRead: (item: InboxNotification) => void
  onMarkAllRead: () => Promise<void> | void
  notificationsHref?: string
  profileHref?: string
}

export function DesktopHeader({
  isScrolled,
  unreadAlertsCount,
  initials,
  userName,
  notifications,
  onMarkRead,
  onMarkAllRead,
  notificationsHref = '/app/notifications',
  profileHref = '/app/profile',
}: DesktopHeaderProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const preview = notifications.slice(0, 6)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header
      className={`
        hidden lg:flex shrink-0 items-center justify-between gap-3
        h-16 px-6
        transition-[background-color,border-color,box-shadow] duration-200 z-10
        ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#E6EADF] shadow-xs'
            : 'bg-[#F6F7F2] border-b border-transparent'
        }
      `}
    >
      <div className="flex min-w-0 items-center gap-2" />

      <div className="flex items-center gap-2">
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E6EADF] text-[#5C6B60] hover:border-[#123524] hover:text-[#10241A] transition-colors ${
              isScrolled ? 'bg-[#F6F7F2] hover:bg-white' : 'bg-white hover:bg-[#F1F5EA]'
            }`}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={open}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadAlertsCount > 99 ? '99+' : unreadAlertsCount}
              </span>
            )}
          </button>

          {open ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-[390px] overflow-hidden rounded-2xl border border-[#E6EADF] bg-white shadow-[0_16px_40px_rgba(16,36,26,0.12)]">
              <div className="flex items-center justify-between border-b border-[#E6EADF] px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-[#10241A]">Notifications</div>
                  <div className="text-[11px] text-[#5C6B60]">
                    {unreadAlertsCount > 0 ? `${unreadAlertsCount} unread` : 'You are caught up'}
                  </div>
                </div>
                {unreadAlertsCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => void onMarkAllRead()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#123524] hover:underline"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all
                  </button>
                ) : null}
              </div>
              <div className="max-h-[70vh] space-y-2 overflow-y-auto p-2">
                {preview.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-[#5C6B60]">No notifications yet.</p>
                ) : (
                  preview.map((item) => (
                    <NotificationCard
                      key={item.id}
                      item={item}
                      compact
                      onOpen={(n) => {
                        onMarkRead(n)
                        setOpen(false)
                      }}
                    />
                  ))
                )}
              </div>
              <div className="border-t border-[#E6EADF] p-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    navigate(notificationsHref)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-center text-xs font-bold text-[#123524] hover:bg-[#F6F7F2]"
                >
                  View notification center
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <Link
          to={profileHref}
          className={`flex min-h-9 items-center gap-2 rounded-full border border-[#E6EADF] py-1 px-3 text-xs font-medium text-[#10241A] hover:border-[#123524] transition-colors ${
            isScrolled ? 'bg-[#F6F7F2] hover:bg-white' : 'bg-white hover:bg-[#F1F5EA]'
          }`}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#123524] text-[10px] font-bold text-white">
            {initials}
          </div>
          <span>{userName?.split(' ')[0] ?? 'User'}</span>
        </Link>
      </div>
    </header>
  )
}
