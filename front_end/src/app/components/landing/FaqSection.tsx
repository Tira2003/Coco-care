import { useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, Plus } from 'lucide-react'

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index))
  }

  const faqs = [
    {
      q: 'How accurate is the AI diagnosis?',
      a: 'The fusion engine combines photo confidence with symptom-questionnaire confidence. When both signals strongly agree (typically 90%+), the report is auto-verified. Lower-agreement cases are routed to agricultural officers for expert review — so nothing slips through.',
    },
    {
      q: 'Does the chatbot make things up?',
      a: 'No. It uses Retrieval-Augmented Generation: your question is embedded (Gemini), matched against official Coconut Research Institute advisory circulars stored in pgvector, and answered by Groq — strictly from retrieved passages, with source citations shown on every reply.',
    },
    {
      q: "What if I can't take a good leaf photo?",
      a: 'Use the guided symptom questionnaires for stem, bud, fruit and general issues. The fusion engine weighs symptom answers heavily when image confidence is low, and officers can always follow up with a request for more photos.',
    },
    {
      q: 'How do outbreak alerts work?',
      a: 'When an officer verifies a case (or the fusion engine auto-verifies a high-confidence one), every farmer within a configurable radius receives an alert with the disease, preventive steps and a link to the live heatmap.',
    },
    {
      q: 'How do I get my farm onboarded?',
      a: 'Sign up on the farmer app, set your location, and your farm profile is created instantly. Admins can batch-import farm records for cooperatives, and officers are assigned by region automatically.',
    },
  ]

  return (
    <section className="py-20 sm:py-24 border-t border-[#E4E8DC]" id="faq">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
              FAQ
            </span>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-[#10241A] mb-4">
              Frequently asked questions
            </h2>
            <p className="text-[#5C6B60] text-base leading-relaxed mb-8">
              Everything you need to know about diagnoses, dashboards and getting your farm onboarded.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#123524] text-white text-sm font-semibold hover:bg-[#0C281B] transition-all"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={item.q}
                  className={`border rounded-2xl bg-white overflow-hidden transition-all duration-200 ${
                    isOpen ? 'border-[#BFD98F] shadow-sm' : 'border-[#E4E8DC]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left font-['Bricolage_Grotesque',sans-serif] font-semibold text-base sm:text-lg text-[#10241A]"
                  >
                    <span>{item.q}</span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-45 bg-[#C9F169] text-[#0C281B]' : 'bg-[#EDF3E0] text-[#123524]'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 sm:px-6 pb-5 text-sm text-[#5C6B60] leading-relaxed border-t border-[#E4E8DC]/50 pt-3">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
