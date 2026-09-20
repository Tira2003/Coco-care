import { Link } from 'react-router'
import { X, MapPin, HelpCircle, LogOut, ChevronRight, Shield } from 'lucide-react'

interface OfficerMobileProfileSheetProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  region: string
  pendingCount: number
  needsReplyCount: number
  unreadCount: number
  initials: string
  handleLogout: () => void
}

export function OfficerMobileProfileSheet({
  isOpen,
  onClose,
  userName,
  region,
  pendingCount,
  needsReplyCount,
  unreadCount,
  initials,
  handleLogout,
}: OfficerMobileProfileSheetProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-[32px] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.18)] max-w-[480px] w-full mx-auto animate-in slide-in-from-bottom duration-300 z-10">
        <div className="w-10 h-1 bg-[#E2E6DC] rounded-full mx-auto mb-3" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F4F6F0] hover:bg-[#EAEFE5] text-[#55655A] flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mt-1">
          <div className="w-14 h-14 rounded-full bg-[#204724] text-white text-lg font-extrabold flex items-center justify-center shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[19px] font-extrabold text-[#123524] truncate">
              {userName ?? 'Officer'}
            </h3>
            <p className="text-[12.5px] text-[#7A8A7E] font-medium mt-0.5 truncate flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {region}
            </p>
          </div>
        </div>

        <div className="bg-[#F7F9F4] rounded-[22px] p-4 mt-5 grid grid-cols-3 divide-x divide-[#E5E9DE] text-center">
          <div className="px-2">
            <div className="text-[17px] font-extrabold text-[#123524] font-['Bricolage_Grotesque',Inter,sans-serif]">
              {pendingCount}
            </div>
            <div className="text-[11px] font-medium text-[#7A8A7E] mt-0.5">Pending</div>
          </div>
          <div className="px-2">
            <div className="text-[17px] font-extrabold text-[#123524] font-['Bricolage_Grotesque',Inter,sans-serif]">
              {needsReplyCount}
            </div>
            <div className="text-[11px] font-medium text-[#7A8A7E] mt-0.5">Replies</div>
          </div>
          <div className="px-2">
            <div className="text-[17px] font-extrabold text-[#123524] font-['Bricolage_Grotesque',Inter,sans-serif]">
              {unreadCount}
            </div>
            <div className="text-[11px] font-medium text-[#7A8A7E] mt-0.5">Inbox</div>
          </div>
        </div>

        <div className="mt-5 space-y-1">
          <Link
            to="/officer/settings"
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold text-[#10241A] hover:bg-[#F6F7F2]"
          >
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#5C6B60]" />
              Account settings
            </span>
            <ChevronRight className="h-4 w-4 text-[#8A9A8E]" />
          </Link>
          <Link
            to="/officer/help"
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold text-[#10241A] hover:bg-[#F6F7F2]"
          >
            <span className="inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#5C6B60]" />
              Help Center
            </span>
            <ChevronRight className="h-4 w-4 text-[#8A9A8E]" />
          </Link>
          <button
            type="button"
            onClick={() => {
              onClose()
              handleLogout()
            }}
            className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-[#E5484D] hover:bg-[#FFF1F2]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
