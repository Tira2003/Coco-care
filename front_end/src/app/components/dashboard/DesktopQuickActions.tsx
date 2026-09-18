import { Link } from 'react-router'
import { Microscope, MessageSquare, Map, TreePine } from 'lucide-react'

interface DesktopQuickActionsProps {
  totalFarmsCount: number
}

export function DesktopQuickActions({ totalFarmsCount }: DesktopQuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-3.5">
      {/* Tile 1: Primary New Diagnosis */}
      <Link
        to="/app/disease-detection"
        className="group flex items-center gap-3 rounded-2xl border border-[#123524] bg-[#123524] p-3 text-white shadow-sm transition-colors hover:bg-[#0C281B] sm:rounded-[18px] sm:p-4 sm:gap-3.5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(201,241,105,.16)] text-[#C9F169] sm:h-11 sm:w-11 sm:rounded-[13px]">
          <Microscope className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <b className="block font-['Bricolage_Grotesque',Inter,sans-serif] text-[13px] font-bold text-white sm:text-sm">
            New Diagnosis
          </b>
          <span className="block truncate text-[10px] text-[#AEC0A6] sm:text-xs">
            Leaf scan · quiz
          </span>
        </div>
      </Link>

      {/* Tile 2: AI Assistant */}
      <Link
        to="/app/chatbot"
        className="group flex items-center gap-3 rounded-2xl border border-[#E6EADF] bg-white p-3 text-[#10241A] shadow-sm transition-colors hover:border-[#BFD98F] hover:bg-[#FBFDF8] sm:rounded-[18px] sm:p-4 sm:gap-3.5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF3E0] text-[#123524] sm:h-11 sm:w-11 sm:rounded-[13px]">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <b className="block font-['Bricolage_Grotesque',Inter,sans-serif] text-[13px] font-bold text-[#10241A] sm:text-sm">
            AI Assistant
          </b>
          <span className="block truncate text-[10px] text-[#5C6B60] sm:text-xs">
            CRI answers
          </span>
        </div>
      </Link>

      {/* Tile 3: Disease Map */}
      <Link
        to="/app/heatmap"
        className="group flex items-center gap-3 rounded-2xl border border-[#E6EADF] bg-white p-3 text-[#10241A] shadow-sm transition-colors hover:border-[#BFD98F] hover:bg-[#FBFDF8] sm:rounded-[18px] sm:p-4 sm:gap-3.5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF2EA] text-[#147A5C] sm:h-11 sm:w-11 sm:rounded-[13px]">
          <Map className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <b className="block font-['Bricolage_Grotesque',Inter,sans-serif] text-[13px] font-bold text-[#10241A] sm:text-sm">
            Disease Map
          </b>
          <span className="block truncate text-[10px] text-[#5C6B60] sm:text-xs">
            Live heatmap
          </span>
        </div>
      </Link>

      {/* Tile 4: My Farms */}
      <Link
        to="/app/profile"
        className="group flex items-center gap-3 rounded-2xl border border-[#E6EADF] bg-white p-3 text-[#10241A] shadow-sm transition-colors hover:border-[#BFD98F] hover:bg-[#FBFDF8] sm:rounded-[18px] sm:p-4 sm:gap-3.5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCF0DA] text-[#8A5A00] sm:h-11 sm:w-11 sm:rounded-[13px]">
          <TreePine className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <b className="block font-['Bricolage_Grotesque',Inter,sans-serif] text-[13px] font-bold text-[#10241A] sm:text-sm">
            My Farms
          </b>
          <span className="block truncate text-[10px] text-[#5C6B60] sm:text-xs">
            {totalFarmsCount} plantation{totalFarmsCount === 1 ? '' : 's'}
          </span>
        </div>
      </Link>
    </div>
  )
}
