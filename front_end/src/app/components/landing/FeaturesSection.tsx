import { Link } from 'react-router'
import {
  ArrowRight,
  Microscope,
  ClipboardList,
  Cpu,
  Bot,
  CloudSun,
  Map,
  BellRing,
  ExternalLink,
} from 'lucide-react'

export function FeaturesSection() {
  return (
    <section className="py-28 sm:py-32 bg-white border-y border-[#E4E8DC]" id="features">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-end mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
              Features
            </span>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-[#10241A]">
              Everything a coconut grower
              <br />
              needs, in one workspace
            </h2>
          </div>
          <div>
            <p className="text-[#5C6B60] text-base leading-relaxed mb-3">
              From snapping a single leaf to island-wide outbreak tracking, each tool is designed for the field — fast, offline-friendly and grounded in CRI science.
            </p>
            <a href="#roles" className="inline-flex items-center gap-1.5 font-semibold text-sm text-[#123524] hover:text-[#7FA81B] transition-colors group">
              See the dashboards
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="bg-[#F6F7F2] border border-[#E4E8DC] rounded-3xl p-7 flex flex-col justify-between hover:bg-white hover:border-[#BFD98F] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EDF3E0] text-[#123524] flex items-center justify-center mb-5">
                <Microscope className="h-6 w-6 text-[#123524]" />
              </div>
              <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-lg text-[#10241A] mb-2">
                AI Leaf Diagnosis
              </h3>
              <p className="text-[#5C6B60] text-sm leading-relaxed">
                Snap a leaf photo — Azure Custom Vision classifies 12 common coconut diseases in seconds, right from the field.
              </p>
            </div>
            <span className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#7FA81B]">
              Computer Vision
            </span>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#F6F7F2] border border-[#E4E8DC] rounded-3xl p-7 flex flex-col justify-between hover:bg-white hover:border-[#BFD98F] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EDF3E0] text-[#123524] flex items-center justify-center mb-5">
                <ClipboardList className="h-6 w-6 text-[#123524]" />
              </div>
              <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-lg text-[#10241A] mb-2">
                Symptom Questionnaires
              </h3>
              <p className="text-[#5C6B60] text-sm leading-relaxed">
                Guided checklists for stem, bud, fruit and general symptoms — when a photo alone isn&apos;t enough.
              </p>
            </div>
            <span className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#7FA81B]">
              Guided Input
            </span>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#F6F7F2] border border-[#E4E8DC] rounded-3xl p-7 flex flex-col justify-between hover:bg-white hover:border-[#BFD98F] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EDF3E0] text-[#123524] flex items-center justify-center mb-5">
                <Cpu className="h-6 w-6 text-[#123524]" />
              </div>
              <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-lg text-[#10241A] mb-2">
                Fusion Engine
              </h3>
              <p className="text-[#5C6B60] text-sm leading-relaxed">
                Image + symptom confidence are fused; high-agreement cases auto-verify, the rest route to officers for review.
              </p>
            </div>
            <span className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#7FA81B]">
              Decision Engine
            </span>
          </div>

          {/* Feature 4: Wide RAG Card */}
          <div className="md:col-span-2 lg:col-span-2 bg-[#123524] text-white rounded-3xl p-7 sm:p-8 flex flex-col lg:flex-row gap-6 items-center justify-between shadow-lg hover:shadow-2xl hover:bg-[#0C281B] transition-all duration-300">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-2xl bg-[#C9F169]/20 text-[#C9F169] flex items-center justify-center mb-5">
                <Bot className="h-6 w-6 text-[#C9F169]" />
              </div>
              <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl sm:text-2xl text-white mb-2">
                CRI-Grounded Chatbot
              </h3>
              <p className="text-[#B9C9B4] text-sm leading-relaxed mb-4">
                Ask anything in plain language — answers come <em>only</em> from official Coconut Research Institute advisory circulars, retrieved with Gemini embeddings + pgvector and generated by Groq, with citations you can check.
              </p>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9F169]">
                RAG · Zero Hallucination by Design
              </span>
            </div>

            {/* Mini Chat Preview */}
            <div className="w-full lg:w-[320px] shrink-0 bg-white/10 border border-white/15 rounded-2xl p-4 text-xs">
              <div className="bg-white/15 rounded-xl p-3 text-[#DCE7D6] mb-2.5 leading-snug">
                My fronds are yellowing and the crown looks wilted. What should I do?
              </div>
              <div className="bg-white text-[#10241A] rounded-xl p-3.5 leading-relaxed shadow-sm">
                Yellowing fronds with a wilted crown point to early <strong className="text-[#123524]">Bud Rot</strong>. Remove and burn affected tissue, apply Bordeaux paste, and improve drainage.
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#C9F169]/30 text-[#123524] px-2 py-0.5 rounded-full">
                    📄 CRI Advisory Circular No. 07
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#F6F7F2] border border-[#E4E8DC] rounded-3xl p-7 flex flex-col justify-between hover:bg-white hover:border-[#BFD98F] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EDF3E0] text-[#123524] flex items-center justify-center mb-5">
                <CloudSun className="h-6 w-6 text-[#123524]" />
              </div>
              <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-lg text-[#10241A] mb-2">
                Weather Forecast
              </h3>
              <p className="text-[#5C6B60] text-sm leading-relaxed">
                Location-based OpenWeatherMap forecasts with spray-window hints, for smarter farm planning.
              </p>
            </div>
            <span className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#7FA81B]">
              Farm Planning
            </span>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#F6F7F2] border border-[#E4E8DC] rounded-3xl p-7 flex flex-col justify-between hover:bg-white hover:border-[#BFD98F] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EDF3E0] text-[#123524] flex items-center justify-center mb-5">
                <Map className="h-6 w-6 text-[#123524]" />
              </div>
              <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-lg text-[#10241A] mb-2">
                Disease Heatmap
              </h3>
              <p className="text-[#5C6B60] text-sm leading-relaxed">
                An interactive Leaflet map of verified and suspected outbreaks across regions — see risk before it reaches your gate.
              </p>
            </div>
            <span className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#7FA81B]">
              Live Map
            </span>
          </div>

          {/* Feature 7 */}
          <div className="bg-[#F6F7F2] border border-[#E4E8DC] rounded-3xl p-7 flex flex-col justify-between hover:bg-white hover:border-[#BFD98F] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EDF3E0] text-[#123524] flex items-center justify-center mb-5">
                <BellRing className="h-6 w-6 text-[#123524]" />
              </div>
              <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-lg text-[#10241A] mb-2">
                Alerts & Review Workflow
              </h3>
              <p className="text-[#5C6B60] text-sm leading-relaxed">
                Officers verify submissions and add advice; nearby farmers get radius-based alerts within minutes.
              </p>
            </div>
            <span className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#7FA81B]">
              Field Workflow
            </span>
          </div>

          {/* Feature 8: CTA Card */}
          <Link
            to="/register"
            className="bg-[#C9F169] border border-[#C9F169] rounded-3xl p-7 flex flex-col justify-between hover:bg-[#d8fa7e] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#123524]/10 text-[#0C281B] flex items-center justify-center mb-5">
                <ExternalLink className="h-5 w-5" />
              </div>
              <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#0C281B] mb-2">
                Ready when you are
              </h3>
              <p className="text-[#3E5421] text-sm leading-relaxed">
                Open the farmer app and run your first diagnosis in under a minute.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0C281B] group-hover:underline">
              Launch demo <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
