import { Link } from 'react-router'
import { Bell } from 'lucide-react'

interface DesktopHeaderProps {
  isScrolled: boolean
  unreadAlertsCount: number
  initials: string
  userName?: string
}

export function DesktopHeader({
  isScrolled,
  unreadAlertsCount,
  initials,
  userName,
}: DesktopHeaderProps) {
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

      {/* Desktop Right: Notification bell + Profile */}
      <div className="flex items-center gap-2">
        <Link
          to="/app/notifications"
          className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E6EADF] text-[#5C6B60] hover:border-[#123524] hover:text-[#10241A] transition-colors ${
            isScrolled ? 'bg-[#F6F7F2] hover:bg-white' : 'bg-white hover:bg-[#F1F5EA]'
          }`}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadAlertsCount}
            </span>
          )}
        </Link>

        <Link
          to="/app/profile"
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
