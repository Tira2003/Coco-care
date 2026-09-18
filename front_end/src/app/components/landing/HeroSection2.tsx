import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, Leaf, MessageSquare, CloudSun } from 'lucide-react'

export function HeroSection2() {
  return (
    <section className="relative overflow-hidden bg-[#F6F7F2] min-h-[92vh]">

      {/* SVG landscape -- absolute at the bottom of the section, no seam */}
      <div className="absolute bottom-0 left-0 w-full h-[75%] pointer-events-none">
        <img
          src="/Palm_trees_in_tropical_landscape_2K_20260917130712.svg"
          alt="Palm trees tropical landscape"
          className="w-full h-full object-cover object-center"
        />
        {/* Fade top of SVG into the section background seamlessly */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#F6F7F2] to-transparent" />
      </div>

      {/* Text content -- sits above the SVG */}
      <div className="relative z-10 pt-36 sm:pt-40 pb-0 text-center px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-5 bg-[#EDF3E0] px-3.5 py-1.5 rounded-full border border-[#D5E2C4]"
        >
          <span className="w-2 h-2 rounded-full bg-[#7FA81B] animate-pulse" />
          AI-Powered Coconut Crop Intelligence
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-['Bricolage_Grotesque',sans-serif] text-4xl sm:text-5xl lg:text-[4.2rem] font-semibold tracking-[-0.02em] leading-[1.12] text-[#10241A] max-w-4xl mx-auto mb-6"
        >
          Detect coconut disease
          <br />
          <span className="font-['Instrument_Serif',serif] italic font-normal text-[#7FA81B]">
            early ,
          </span>{' '}
          before it spreads.
        </motion.h1>

        {/* Lead Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-[#3E4D42] max-w-2xl mx-auto leading-relaxed mb-10 font-medium"
        >
          COCO CARE helps Sri Lankan coconut farmers identify possible disease early, find trusted guidance, understand verified local outbreaks and keep farm records together.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-base font-semibold bg-[#123524] text-white hover:bg-[#0C281B] transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 group"
          >
            Launch Farmer App
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center px-7 py-3.5 rounded-full text-base font-semibold text-[#10241A] border border-[#D0D7C6] bg-white hover:border-[#123524] hover:bg-white transition-all duration-200"
          >
            Explore Features
          </a>
        </motion.div>
      </div>

      {/* Floating Card 1: Leaf analysis -- left, sits on the landscape */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden sm:block absolute bottom-[22%] left-6 sm:left-12 lg:left-20 w-[245px] sm:w-[275px] bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_18px_44px_rgba(16,36,26,0.22)] text-left z-20"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5C6B60] mb-2">
          <span className="w-6 h-6 rounded-lg bg-[#EDF3E0] text-[#123524] flex items-center justify-center">
            <Leaf className="h-3.5 w-3.5" />
          </span>
          Leaf analysis · Report #1287
        </div>
        <div className="flex items-center justify-between font-['Bricolage_Grotesque',sans-serif] font-bold text-sm text-[#10241A]">
          Bud Rot
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#C9F169] text-[#0C281B] px-2 py-0.5 rounded-full">
            Fusion verified
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E9EEE0] my-2.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '94%' }}
            transition={{ duration: 1.4, delay: 0.4 }}
            className="h-full rounded-full bg-gradient-to-r from-[#7FA81B] to-[#C9F169]"
          />
        </div>
        <div className="flex justify-between text-xs text-[#5C6B60] font-semibold">
          <span>Confidence</span>
          <b className="text-[#10241A]">94%</b>
        </div>
      </motion.div>

      {/* Floating Card 2: Ask Coco Care -- right */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="hidden md:block absolute bottom-[30%] right-6 sm:right-12 lg:right-20 w-[300px] lg:w-[320px] bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_18px_44px_rgba(16,36,26,0.22)] text-left z-20"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5C6B60] mb-2.5">
          <span className="w-6 h-6 rounded-lg bg-[#EDF3E0] text-[#123524] flex items-center justify-center">
            <MessageSquare className="h-3.5 w-3.5" />
          </span>
          Ask Coco Care
        </div>
        <div className="text-xs space-y-2">
          <div className="text-[#5C6B60] pl-2 border-l-2 border-[#E4E8DC] leading-snug">
            Fronds are yellowing and the crown looks wilted -- what should I do?
          </div>
          <div className="text-[#10241A] leading-relaxed pt-1">
            This suggests early <strong className="text-[#123524]">Bud Rot</strong>. Remove affected tissue, apply Bordeaux paste on the cut, and improve drainage.
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-[#EDF3E0] text-[#123524] px-2.5 py-0.5 rounded-full">
              CRI Circular No. 07
            </span>
          </div>
        </div>
      </motion.div>

      {/* Floating Card 3: Weather -- bottom right */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="hidden lg:block absolute bottom-[8%] right-16 w-[230px] bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl p-3.5 shadow-[0_18px_44px_rgba(16,36,26,0.22)] text-left z-20"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5C6B60] mb-1.5">
          <span className="w-6 h-6 rounded-lg bg-[#EDF3E0] text-[#123524] flex items-center justify-center">
            <CloudSun className="h-3.5 w-3.5" />
          </span>
          Kurunegala · Now
        </div>
        <div className="flex items-center justify-between font-['Bricolage_Grotesque',sans-serif] font-bold text-sm text-[#10241A]">
          29°C
          <span className="text-[11px] font-bold bg-[#EDF3E0] text-[#123524] px-2 py-0.5 rounded-full">
            Low disease risk
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-[#5C6B60] font-medium mt-2 pt-1 border-t border-[#E4E8DC]/60">
          <span>Humidity 78%</span>
          <span>Rain in 2 days</span>
        </div>
      </motion.div>

      {/* Partner Strip */}
      <div className="relative z-20 max-w-[1200px] mx-auto px-6 pt-8 pb-6 mt-auto flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold tracking-wider text-[#7C887A] uppercase" style={{ marginTop: 'calc(58% - 2rem)' }}>
        
      </div>
    </section>
  )
}
export { HeroSection2 as HeroSection }
