import { Link } from 'react-router'
import { X, MapPin, Smartphone, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react'

interface MobileProfileSheetProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  farmName: string
  farmLocation: string
  treeCount: number
  landArea: string
  aiScansCount: number
  initials: string
  handleLogout: () => void
}

export function MobileProfileSheet({
  isOpen,
  onClose,
  userName,
  farmName,
  farmLocation,
  treeCount,
  landArea,
  aiScansCount,
  initials,
  handleLogout,
}: MobileProfileSheetProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet Panel */}
      <div className="relative bg-white rounded-t-[32px] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.18)] max-w-[480px] w-full mx-auto animate-in slide-in-from-bottom duration-300 z-10">
        {/* Grab handle */}
        <div className="w-10 h-1 bg-[#E2E6DC] rounded-full mx-auto mb-3" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F4F6F0] hover:bg-[#EAEFE5] text-[#55655A] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User profile info */}
        <div className="flex items-center gap-3.5 mt-1">
          <div className="w-14 h-14 rounded-full bg-[#204724] text-white text-lg font-extrabold flex items-center justify-center shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[19px] font-extrabold text-[#123524] truncate">
              {userName ?? 'Sunil Perera'}
            </h3>
            <p className="text-[12.5px] text-[#7A8A7E] font-medium mt-0.5 truncate">
              {farmName} · {farmLocation}
            </p>
          </div>
        </div>

        {/* Stats row (Trees, Land, AI scans) */}
        <div className="bg-[#F7F9F4] rounded-[22px] p-4 mt-5 grid grid-cols-3 divide-x divide-[#E5E9DE] text-center">
          <div className="px-2">
            <div className="text-[17px] font-extrabold text-[#123524] font-['Bricolage_Grotesque',Inter,sans-serif]">
              {treeCount}
            </div>
            <div className="text-[11px] font-medium text-[#7A8A7E] mt-0.5">Trees</div>
          </div>
          <div className="px-2">
            <div className="text-[17px] font-extrabold text-[#123524] font-['Bricolage_Grotesque',Inter,sans-serif]">
              {landArea}
            </div>
            <div className="text-[11px] font-medium text-[#7A8A7E] mt-0.5">Land</div>
          </div>
          <div className="px-2">
            <div className="text-[17px] font-extrabold text-[#123524] font-['Bricolage_Grotesque',Inter,sans-serif]">
              {aiScansCount}
            </div>
            <div className="text-[11px] font-medium text-[#7A8A7E] mt-0.5">AI scans</div>
          </div>
        </div>

        {/* Menu options */}
        <div className="mt-4 divide-y divide-[#F0F3EB]">
          <Link
            to="/app/profile"
            onClick={onClose}
            className="flex items-center justify-between py-3.5 text-[14px] font-medium text-[#123524] hover:bg-[#F8FAF5] px-1 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-[18px] h-[18px] text-[#55655A]" />
              <span>My farm details</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0ACA0]" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-between py-3.5 text-[14px] font-medium text-[#123524] hover:bg-[#F8FAF5] px-1 rounded-lg transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-[18px] h-[18px] text-[#55655A]" />
              <span>Saved guides</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0ACA0]" />
          </button>

          <Link
            to="/app/profile"
            onClick={onClose}
            className="flex items-center justify-between py-3.5 text-[14px] font-medium text-[#123524] hover:bg-[#F8FAF5] px-1 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-[18px] h-[18px] text-[#55655A]" />
              <span>Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0ACA0]" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-between py-3.5 text-[14px] font-medium text-[#123524] hover:bg-[#F8FAF5] px-1 rounded-lg transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-[18px] h-[18px] text-[#55655A]" />
              <span>Help & support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0ACA0]" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              handleLogout()
            }}
            className="w-full flex items-center gap-3 py-3.5 text-[14px] font-bold text-[#E5484D] hover:bg-[#FFF1F2] px-1 rounded-lg transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px] text-[#E5484D]" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
