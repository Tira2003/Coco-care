import { Sprout, ScanLine, ShieldCheck } from 'lucide-react'

export function HowItWorksSection() {
  const steps = [
    {
      step: 'Step 01',
      title: 'Tell us about your farm',
      icon: Sprout,
      description:
        'Create a simple farm record with location, size and trees. This gives every future check useful context.',
    },
    {
      step: 'Step 02',
      title: 'Check what you are seeing',
      icon: ScanLine,
      description:
        'Upload a leaf image or work through a guided symptom questionnaire for other parts of the palm.',
    },
    {
      step: 'Step 03',
      title: 'Verify',
      icon: ShieldCheck,
      description:
        'See an initial result, recommendations and confidence — then save the report for professional review',
    },
  ]

  return (
    <section className="py-20 sm:py-24" id="how">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-end mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
              How It Works
            </span>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-[#10241A]">
              Three steps.
              <br />
              One clearer picture.
            </h2>
          </div>
          <div>
            <p className="text-[#5C6B60] text-base leading-relaxed">
              COCO CARE keeps the technology out of your way. It turns scattered signs into a record you can understand and share.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="bg-white border border-[#E4E8DC] rounded-3xl p-7 relative hover:border-[#BFD98F] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#EDF3E0] text-[#123524] flex items-center justify-center shadow-2xs">
                      <Icon className="h-6 w-6 text-[#123524]" />
                    </div>
                    <span className="font-['Instrument_Serif',serif] italic text-base text-[#7FA81B] font-bold">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#10241A] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#5C6B60] text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
