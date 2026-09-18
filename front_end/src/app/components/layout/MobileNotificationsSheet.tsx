import { Link } from 'react-router'
import { X, Bell, AlertTriangle, Sparkles } from 'lucide-react'
import type { DiseaseAlert, BroadcastNotification } from '@/types'

interface MobileNotificationsSheetProps {
  isOpen: boolean
  onClose: () => void
  diseaseAlerts: DiseaseAlert[]
  broadcasts: BroadcastNotification[]
  unreadAlertsCount: number
  onMarkAllRead: () => Promise<void>
}

export function MobileNotificationsSheet({
  isOpen,
  onClose,
  diseaseAlerts,
  broadcasts,
  unreadAlertsCount,
  onMarkAllRead,
}: MobileNotificationsSheetProps) {
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

        {/* Header: Notifications + Mark all read + Close */}
        <div className="flex items-center justify-between mt-1 mb-3">
          <h3 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-[20px] font-extrabold text-[#123524]">
            Notifications
          </h3>
          <div className="flex items-center gap-3">
            {unreadAlertsCount > 0 ? (
              <button
                type="button"
                onClick={() => void onMarkAllRead()}
                className="text-xs font-bold text-[#2E5A27] hover:underline cursor-pointer"
              >
                Mark all read
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

        {/* Notifications items list */}
        <div className="divide-y divide-[#F0F3EB] max-h-[60vh] overflow-y-auto pr-1">
          {diseaseAlerts.length === 0 && broadcasts.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-[#EDF3E0] text-[#123524] flex items-center justify-center mx-auto mb-2">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-[14px] font-bold text-[#123524]">All caught up!</div>
              <p className="text-[12px] text-[#5C6B60] mt-0.5">
                No active disease alerts or announcements for your area.
              </p>
            </div>
          ) : (
            <>
              {diseaseAlerts.map((a) => (
                <div key={a.id} className="py-3.5 flex gap-3.5 items-start">
                  <div
                    className={`w-10 h-10 rounded-[14px] ${
                      a.alertType === 'ai_suspected'
                        ? 'bg-[#FEF0D6] text-[#B45309]'
                        : 'bg-[#FDE8E8] text-[#E5484D]'
                    } flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-[#123524] leading-snug">
                      {a.diseaseType} outbreak alert
                    </div>
                    <p className="text-[12px] text-[#5C6B60] mt-0.5 leading-relaxed">
                      {a.message || `Case reported ${a.distanceKm} km away. Check your palms.`}
                    </p>
                    <span className="text-[11px] font-medium text-[#8A9A8E] mt-1 block">
                      {a.distanceKm} km away ·{' '}
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {broadcasts.map((b) => (
                <div key={b.id} className="py-3.5 flex gap-3.5 items-start">
                  <div className="w-10 h-10 rounded-[14px] bg-[#EBF5DE] text-[#2E5A27] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-[#123524] leading-snug">
                      {b.title}
                    </div>
                    <p className="text-[12px] text-[#5C6B60] mt-0.5 leading-relaxed">
                      {b.message}
                    </p>
                    <span className="text-[11px] font-medium text-[#8A9A8E] mt-1 block">
                      {new Date(b.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#F0F3EB] text-center">
          <Link
            to="/app/notifications"
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
