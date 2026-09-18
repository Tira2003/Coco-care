import { Link } from 'react-router'
import { Leaf, MoreHorizontal, TrendingUp, AlertTriangle } from 'lucide-react'

interface MobileTwinStatsProps {
  healthScore: string
  unreadAlertCount: number
}

export function MobileTwinStats({ healthScore, unreadAlertCount }: MobileTwinStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Farm health card */}
      <div className="rounded-[24px] border border-[#E8ECE2] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-[13px] bg-[#EAF5DF] text-[#2D5B25] flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <button
            type="button"
            className="text-[#A0ACA0] hover:text-[#5C6B60] transition-colors p-1 -mr-1"
            title="More options"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3">
          <div className="text-[28px] font-extrabold text-[#123524] leading-tight font-['Bricolage_Grotesque',Inter,sans-serif]">
            {Math.round(Number(healthScore))}
            <span className="text-[13px] font-semibold text-[#8A9A8E]">/100</span>
          </div>
          <div className="text-[12px] font-semibold text-[#5C6B60] mt-0.5">
            Farm health score
          </div>
          <div className="flex items-center gap-1 text-[11.5px] font-bold text-[#16A34A] mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2 this week</span>
          </div>
        </div>
      </div>

      {/* Active alerts card */}
      <Link
        to="/app/notifications"
        className="rounded-[24px] border border-[#E8ECE2] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between active:scale-98 transition-transform"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-[13px] bg-[#FEF0D6] text-[#B45309] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-[#A0ACA0] p-1 -mr-1">
            <MoreHorizontal className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-[28px] font-extrabold text-[#123524] leading-tight font-['Bricolage_Grotesque',Inter,sans-serif]">
            {unreadAlertCount}
          </div>
          <div className="text-[12px] font-semibold text-[#5C6B60] mt-0.5">
            Active alerts
          </div>
          <div className="flex items-center gap-1 text-[11.5px] font-bold text-[#C05621] mt-2">
            <span>
              {unreadAlertCount > 0
                ? `${unreadAlertCount} need${unreadAlertCount === 1 ? 's' : ''} action →`
                : 'All clear →'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
