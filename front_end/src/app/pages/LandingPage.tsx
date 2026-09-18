import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check } from 'lucide-react'
import {
  LandingHeader,
  HeroSection,
  StatsSection,
  AboutSection,
  FeaturesSection,
  HowItWorksSection,
  DiseaseMapSection,
  RolesSection,
  TestimonialsSection,
  InsightsSection,
  FaqSection,
  CtaSection,
  LandingFooter,
} from '../components/landing'

export function LandingPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3400)
  }

  return (
    <div className="min-h-screen bg-[#F6F7F2] text-[#10241A] font-['Inter',system-ui,sans-serif] selection:bg-[#C9F169] selection:text-[#0C281B]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-[#0C281B] px-5 py-3 text-sm font-semibold text-white shadow-2xl border border-white/10"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9F169] text-[#0C281B]">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            </span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <LandingHeader />

      {/* Main Content Sections */}
      <main id="top">
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DiseaseMapSection />
        <RolesSection showToast={showToast} />
        <TestimonialsSection />
        <InsightsSection showToast={showToast} />
        <FaqSection />
        <CtaSection showToast={showToast} />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}