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
    {
      quote:
        'Managing 35 acres of tall palms used to mean endless manual tree counting and guesswork. The offline diagnosis and heatmap keep our estate yield consistently high.',
      initials: 'KW',
      name: 'Kavinda Wickramasinghe',
      role: 'Estate Manager · Gampaha',
      gradient: 'from-[#1E4D36] to-[#458763]',
    },
    {
      quote:
        'I took a leaf photo of strange yellow speckles, and within seconds the AI explained it was magnesium deficiency and prescribed the exact fertilizer dose. Simple and life-saving.',
      initials: 'SS',
      name: 'Sunil Shantha',
      role: 'Smallholder Farmer · Kuliyapitiya',
      gradient: 'from-[#8A6D3B] to-[#C4A052]',
    },
    {
      quote:
        'Grounding the AI in official Coconut Research Institute manuals is the key differentiator. Farmers receive scientifically sound treatments, stopping Whitefly spread immediately.',
      initials: 'PS',
      name: 'Dr. Priyantha Senanayake',
      role: 'Agronomy Consultant · Lunuwila',
      gradient: 'from-[#2A5C70] to-[#549BB5]',
    },
  ]

  // Double the array for seamless continuous loop
  const carouselItems = [...testimonials, ...testimonials]

  return (
    <section className="py-20 sm:py-28 bg-[#0C281B] text-white relative overflow-hidden" id="testimonials">
      <style>{`
        @keyframes marquee-ltr {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .animate-marquee-ltr {
          display: flex;
          width: max-content;
          animation: marquee-ltr 45s linear infinite;
        }
        .animate-marquee-ltr:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(201,241,105,0.08),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(127,168,27,0.10),transparent_70%)] blur-2xl" />

      <div className="max-w-[1200px] mx-auto px-6 mb-12 sm:mb-16">
        <div className="text-center max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-[#C9F169] text-[#0C281B] px-3.5 py-1 rounded-full mb-4 shadow-sm">
            Testimonials
          </span>
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-3">
            What farmers & officers say
          </h2>
          <p className="text-[#AEC0A6] text-sm sm:text-base">
            Real stories from the growers, officers, and agronomists protecting Sri Lanka's coconut triangle.
          </p>
        </div>
      </div>

      {/* Edge gradient fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-r from-[#0C281B] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-l from-[#0C281B] to-transparent z-10" />

      {/* Carousel Track moving slowly left to right */}
      <div className="w-full overflow-hidden py-4 cursor-default">
        <div className="animate-marquee-ltr gap-6">
          {carouselItems.map((t, idx) => (
            <div
              key={`${t.name}-${idx}`}
              className="w-[320px] sm:w-[380px] lg:w-[420px] shrink-0 bg-white text-[#10241A] rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-xl border border-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-['Instrument_Serif',serif] text-5xl text-[#7FA81B] leading-none select-none">
                    &ldquo;
                  </span>
                  <div className="flex gap-1 text-[#C9F169]">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 fill-[#7FA81B]"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm sm:text-[0.95rem] text-[#37473C] leading-relaxed mb-6 font-normal">
                  {t.quote}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#E4E8DC]">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0`}
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <b className="font-['Bricolage_Grotesque',sans-serif] text-[#10241A] block text-sm sm:text-base truncate">
                    {t.name}
                  </b>
                  <span className="text-xs text-[#5C6B60] block truncate">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
