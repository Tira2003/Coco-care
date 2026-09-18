export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'The app flagged Bud Rot on a tree I thought was perfectly fine. I caught it two weeks early and saved the whole cluster. That one alert paid for my phone.',
      initials: 'NP',
      name: 'Nimal Perera',
      role: 'Farmer · Kurunegala',
      gradient: 'from-[#5B7A46] to-[#8FB563]',
    },
    {
      quote:
        'Fusion-verified reports mean I only review what truly needs a human eye. Outbreak alerts that used to take weeks now reach nearby farms in minutes.',
      initials: 'DF',
      name: 'Dilani Fernando',
      role: 'Agricultural Officer · Puttalam',
      gradient: 'from-[#7A5B3D] to-[#B08D5B]',
    },
  ]

  return (
    <section className="py-20 sm:py-24 bg-[#0C281B] text-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-[#C9F169] text-[#0C281B] px-3.5 py-1 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
            What farmers & officers say
          </h2>
          <p className="text-[#AEC0A6] text-base">
            Real stories from the people who nurture, protect and verify the coconut triangle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white text-[#10241A] rounded-3xl p-8 flex flex-col justify-between shadow-xl">
              <span className="font-['Instrument_Serif',serif] text-5xl text-[#7FA81B] leading-none mb-4 block">
                &ldquo;
              </span>
              <p className="text-base text-[#37473C] leading-relaxed mb-6">
                {t.quote}
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#E4E8DC]">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                  {t.initials}
                </div>
                <div>
                  <b className="font-['Bricolage_Grotesque',sans-serif] text-[#10241A] block">{t.name}</b>
                  <span className="text-xs text-[#5C6B60]">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
