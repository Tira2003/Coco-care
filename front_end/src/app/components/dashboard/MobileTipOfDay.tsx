import { Sparkles } from 'lucide-react'

export function MobileTipOfDay() {
  return (
    <div className="flex gap-3.5 bg-[#EAF5DF] border border-[#D5EAC3] rounded-[24px] p-4 items-start shadow-2xs">
      <div className="w-10 h-10 rounded-[14px] bg-[#D4ED9C] text-[#2D5B25] flex items-center justify-center shrink-0 shadow-2xs">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-extrabold text-[#1C3E20]">Tip of the day</div>
        <p className="text-[12.5px] text-[#2D5B25]/90 leading-relaxed mt-1">
          Inspect leaf axils for rhinoceros beetle damage — early removal of affected fronds stops spread to healthy crowns.
        </p>
      </div>
    </div>
  )
}
