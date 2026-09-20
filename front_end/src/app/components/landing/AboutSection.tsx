export function AboutSection() {
  return (
    <section className="py-20 sm:py-24" id="about">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-end mb-12">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
              About Coco Care
            </span>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-[#10241A]">
              Cultivating healthy groves,
              <br />
              connected communities
            </h2>
          </div>
          <div>
            <p className="text-[#5C6B60] text-base leading-relaxed">
              We blend computer-vision leaf diagnosis, guided symptom questionnaires and a RAG assistant trained on real Coconut Research Institute manuals — so every farmer can act on expert knowledge the moment it matters.
            </p>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-black/5">
          <img
            src="/pexels-dmrishabh-2071228508-29267184.jpg"
            alt="Aerial view of green plantation landscape"
            className="w-full h-[320px] sm:h-[380px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C281B]/80 via-transparent to-transparent" />
          <p className="absolute left-6 sm:left-10 bottom-6 sm:bottom-8 z-10 text-white font-['Instrument_Serif',serif] italic text-xl sm:text-2xl max-w-xl">
            &ldquo;From the first yellowing frond to a verified recovery — expert care for every palm.&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}
