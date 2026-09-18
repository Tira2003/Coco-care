import { Link } from 'react-router'
import { Bell, MapPin, ChevronDown, Leaf } from 'lucide-react'

interface MobileHeaderProps {
  locationPath: string
  farmName: string
  unreadAlertsCount: number
  initials: string
  onOpenProfile: () => void
  onOpenNotifications: () => void
}

export function MobileHeader({
  locationPath,
  farmName,
  unreadAlertsCount,
  initials,
  onOpenProfile,
  onOpenNotifications,
}: MobileHeaderProps) {
  return (
    <header
      className="lg:hidden flex shrink-0 items-center justify-between h-[58px] px-4 bg-[#F6F7F2] border-b border-[#E6EADF]/60 text-[#123524] z-20"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Left: Farm location pill on /app, or Logo on other screens */}
      {locationPath === '/app' ? (
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D5DDD0] bg-[#EFF3E9] text-[#244B22] font-semibold text-xs active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-[#244B22]" />
          <span>{farmName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#5C6B60]" />
        </button>
      ) : (
        <Link to="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#166534] shrink-0 shadow-2xs">
            <Leaf className="w-4 h-4" />
          </div>
          <div className="text-[18px] font-extrabold tracking-tight text-[#123524] leading-none font-['Bricolage_Grotesque',Inter,sans-serif]">
            Coco<span className="text-[#3DA35D]">Care</span>
          </div>
        </Link>
      )}

      {/* Actions: Notification bell + Profile avatar */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-full bg-white border border-[#E6EADF] shadow-2xs hover:bg-[#F1F5EA] active:scale-90 flex items-center justify-center text-[#244B22] transition-all cursor-pointer"
          title="Notifications"
          aria-label="Open notifications"
        >
          <Bell className="w-[17px] h-[17px]" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#E5484D] border-2 border-white rounded-full text-[9px] font-extrabold text-white flex items-center justify-center leading-none">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-[#204724] text-white font-extrabold text-xs flex items-center justify-center shadow-xs active:scale-90 transition-all border border-white/20 cursor-pointer"
          title="Profile"
          aria-label="Open profile"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
