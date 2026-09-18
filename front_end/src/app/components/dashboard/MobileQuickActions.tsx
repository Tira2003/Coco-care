import { Link } from 'react-router'
import { Camera, Map, MessageSquare, Smartphone } from 'lucide-react'

export function MobileQuickActions() {
  return (
    <div className="space-y-2.5 pt-1">
      <h2 className="text-[16px] font-extrabold text-[#123524]">Quick actions</h2>
      <div className="grid grid-cols-4 gap-2.5">
        <Link
          to="/app/disease-detection"
          className="flex flex-col items-center justify-center gap-2 rounded-[22px] border border-[#E8ECE2] bg-white py-3.5 px-1 shadow-[0_2px_6px_rgba(0,0,0,0.02)] active:scale-95 transition-transform text-center"
        >
          <span className="w-11 h-11 rounded-[14px] bg-[#D8F396] text-[#2D5B25] flex items-center justify-center shadow-xs">
            <Camera className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-bold text-[#2C3B30]">Scan leaf</span>
        </Link>

        <Link
          to="/app/heatmap"
          className="flex flex-col items-center justify-center gap-2 rounded-[22px] border border-[#E8ECE2] bg-white py-3.5 px-1 shadow-[0_2px_6px_rgba(0,0,0,0.02)] active:scale-95 transition-transform text-center"
        >
          <span className="w-11 h-11 rounded-[14px] bg-[#DCFCE7] text-[#166534] flex items-center justify-center shadow-xs">
            <Map className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-bold text-[#2C3B30]">Heat map</span>
        </Link>

        <Link
          to="/app/chatbot"
          className="flex flex-col items-center justify-center gap-2 rounded-[22px] border border-[#E8ECE2] bg-white py-3.5 px-1 shadow-[0_2px_6px_rgba(0,0,0,0.02)] active:scale-95 transition-transform text-center"
        >
          <span className="w-11 h-11 rounded-[14px] bg-[#FEF0D6] text-[#B45309] flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-bold text-[#2C3B30]">CocoBot</span>
        </Link>

        <Link
          to="/app/profile"
          className="flex flex-col items-center justify-center gap-2 rounded-[22px] border border-[#E8ECE2] bg-white py-3.5 px-1 shadow-[0_2px_6px_rgba(0,0,0,0.02)] active:scale-95 transition-transform text-center"
        >
          <span className="w-11 h-11 rounded-[14px] bg-[#DBEAFE] text-[#1E40AF] flex items-center justify-center shadow-xs">
            <Smartphone className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-bold text-[#2C3B30]">Care guide</span>
        </Link>
      </div>
    </div>
  )
}
