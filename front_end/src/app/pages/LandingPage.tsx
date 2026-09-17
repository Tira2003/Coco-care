import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowRight,
  Menu,
  X,
  Plus,
  Check,
  Twitter,
  Linkedin,
  Youtube,
  ExternalLink,
  Palmtree,
  Leaf,
  MessageSquare,
  CloudSun,
  Microscope,
  ClipboardList,
  Cpu,
  Bot,
  Map,
  BellRing,
  Sprout,
  ShieldCheck,
  Settings,
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// --- Animated Counter Component ---
function Counter({ target, suffix = '', duration = 1500 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let startTimestamp: number | null = null
    let frameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      }
    }
    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [inView, target, duration])

  return (
    <div ref={ref} className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#123524] font-['Bricolage_Grotesque',sans-serif]">
      {count.toLocaleString()}
      {suffix}
    </div>
  )
}

// --- Leaflet Outbreak Map Component ---
function DiseaseLeafletMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([7.6, 80.1], 7)

    mapInstanceRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map)

    map.on('click', () => map.scrollWheelZoom.enable())

    const colors: Record<string, string> = {
      verified: '#E5484D',
      suspected: '#F5A524',
      cleared: '#3DA35D',
    }

    const spots = [
      { c: [7.48, 80.36] as [number, number], t: 'Kurunegala', s: 'verified', r: 22, d: 'Bud Rot — 12 verified reports this month' },
      { c: [7.94, 79.84] as [number, number], t: 'Puttalam', s: 'verified', r: 18, d: 'Stem Bleeding — 7 verified reports' },
      { c: [7.09, 80.15] as [number, number], t: 'Kegalle', s: 'suspected', r: 14, d: 'Leaf Miner — 3 suspected cases under review' },
      { c: [7.29, 80.63] as [number, number], t: 'Matale', s: 'suspected', r: 12, d: 'Grey Leaf Spot — 2 suspected cases' },
      { c: [6.93, 79.86] as [number, number], t: 'Colombo / Gampaha', s: 'cleared', r: 10, d: 'Cleared — no active outbreaks' },
      { c: [8.35, 80.50] as [number, number], t: 'Anamaduwa', s: 'cleared', r: 9, d: 'Cleared — treated & recovered' },
    ]

    spots.forEach((p) => {
      L.circleMarker(p.c, {
        radius: p.r,
        color: colors[p.s],
        weight: 2,
        fillColor: colors[p.s],
        fillOpacity: 0.32,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:'Inter',sans-serif;font-size:13px;line-height:1.4;">
            <b style="color:#10241A;font-size:14px;">${p.t}</b><br>
            <span style="color:#5C6B60;">${p.d}</span><br>
            <span style="color:${colors[p.s]};font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:0.06em;display:inline-block;margin-top:4px;">
              ${p.s}
            </span>
          </div>`
        )
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  return <div ref={mapContainerRef} className="h-[460px] w-full rounded-2xl overflow-hidden filter saturate-[.95]" />
}

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeRole, setActiveRole] = useState<'farmer' | 'officer' | 'admin'>('farmer')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [ctaInput, setCtaInput] = useState('')
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3400)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index))
  }

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctaInput.trim()) return
    showToast("Thanks! We'll be in touch within 24 hours. 🌴")
    setCtaInput('')
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

      {/* ================= HEADER ================= */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#F6F7F2]/90 backdrop-blur-md border-b border-[#E4E8DC] shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-[74px] flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#10241A] group">
            <span className="w-9 h-9 rounded-xl bg-[#123524] flex items-center justify-center text-[#C9F169] shadow-sm transition-transform group-hover:scale-105">
              <Palmtree className="h-5 w-5 text-[#C9F169]" />
            </span>
            <span>Coco Care</span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#how' },
              { label: 'Disease Map', href: '#map' },
              { label: 'Roles', href: '#roles' },
              { label: 'Insights', href: '#insights' },
              { label: 'FAQ', href: '#faq' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 rounded-full text-[0.92rem] font-medium text-[#5C6B60] hover:text-[#10241A] hover:bg-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Nav CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-[0.92rem] font-semibold text-[#10241A] border border-[#E4E8DC] hover:border-[#123524] hover:bg-white transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[0.92rem] font-semibold bg-[#C9F169] text-[#0C281B] hover:bg-[#d8fa7e] transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[#E4E8DC] text-[#10241A] hover:bg-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mx-4 my-2 rounded-2xl bg-white border border-[#E4E8DC] p-4 shadow-xl space-y-1"
            >
              {[
                { label: 'Features', href: '#features' },
                { label: 'How it works', href: '#how' },
                { label: 'Disease Map', href: '#map' },
                { label: 'Roles', href: '#roles' },
                { label: 'Insights', href: '#insights' },
                { label: 'FAQ', href: '#faq' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-[#10241A] hover:bg-[#EDF3E0] transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-[#E4E8DC] flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#E4E8DC] text-[#10241A]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#C9F169] text-[#0C281B]"
                >
                  Launch App
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        {/* ================= HERO ================= */}
        <section className="pt-36 sm:pt-40 pb-12 sm:pb-16 text-center relative overflow-hidden">
          {/* Subtle Radial Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle_at_50%_30%,#E9F3D2_0%,transparent_70%)] opacity-80" />

          <div className="max-w-[1200px] mx-auto px-6 relative z-10">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-5 bg-[#EDF3E0] px-3.5 py-1.5 rounded-full"
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
                early
              </span>{' '}
              before it spreads.
            </motion.h1>

            {/* Lead Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#5C6B60] max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Coco Care combines AI leaf diagnosis, symptom questionnaires, CRI-grounded advice, live weather and outbreak alerts in one workspace for farmers, officers and admins.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-4 flex-wrap mb-14"
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
                className="inline-flex items-center px-7 py-3.5 rounded-full text-base font-semibold text-[#10241A] border border-[#E4E8DC] hover:border-[#123524] hover:bg-white transition-all duration-200"
              >
                Explore Features
              </a>
            </motion.div>
          </div>

          {/* Hero Media + Floating Cards */}
          <div className="max-w-[1160px] mx-auto px-6 relative">
            <div className="rounded-[28px] overflow-hidden shadow-2xl border border-black/5 aspect-[16/8.4] max-h-[580px] bg-gradient-to-br from-[#DCEBC4] to-[#9CC069] relative">
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=80"
                alt="Lush coconut estate canopy from above"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Card 1: Leaf analysis */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[8%] left-8 sm:left-10 w-[245px] sm:w-[275px] bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_18px_44px_rgba(16,36,26,0.18)] text-left"
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

            {/* Floating Card 2: Ask Coco Care */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="hidden md:block absolute top-[18%] right-8 sm:right-10 w-[300px] lg:w-[320px] bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_18px_44px_rgba(16,36,26,0.18)] text-left"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5C6B60] mb-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#EDF3E0] text-[#123524] flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5" />
                </span>
                Ask Coco Care
              </div>
              <div className="text-xs space-y-2">
                <div className="text-[#5C6B60] pl-2 border-l-2 border-[#E4E8DC] leading-snug">
                  Fronds are yellowing and the crown looks wilted — what should I do?
                </div>
                <div className="text-[#10241A] leading-relaxed pt-1">
                  This suggests early <strong className="text-[#123524]">Bud Rot</strong>. Remove affected tissue, apply Bordeaux paste on the cut, and improve drainage.
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-[#EDF3E0] text-[#123524] px-2.5 py-0.5 rounded-full">
                    📄 CRI Circular No. 07
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 3: Weather */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="hidden lg:block absolute bottom-[8%] right-16 w-[230px] bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl p-3.5 shadow-[0_18px_44px_rgba(16,36,26,0.18)] text-left"
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
          </div>

          {/* Partner Strip */}
          <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold tracking-wider text-[#8B9689] uppercase">
            <span className="text-[#10241A] font-bold">Built on</span>
            <span>CRI Advisory Circulars</span>
            <span>·</span>
            <span>Azure Custom Vision</span>
            <span>·</span>
            <span>Gemini Embeddings</span>
            <span>·</span>
            <span>pgvector</span>
            <span>·</span>
            <span>Groq</span>
            <span>·</span>
            <span>OpenWeatherMap</span>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="py-12 border-t border-[#E4E8DC] bg-white/40">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
              <Counter target={25000} suffix="+" />
              <div className="mt-1 text-sm font-medium text-[#5C6B60]">Palms scanned</div>
            </div>
            <div className="text-center p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
              <Counter target={12} />
              <div className="mt-1 text-sm font-medium text-[#5C6B60]">Diseases detected</div>
            </div>
            <div className="text-center p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
              <Counter target={94} suffix="%" />
              <div className="mt-1 text-sm font-medium text-[#5C6B60]">Fusion accuracy</div>
            </div>
            <div className="text-center p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
              <Counter target={150} suffix="+" />
              <div className="mt-1 text-sm font-medium text-[#5C6B60]">Officers verifying</div>
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
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
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1800&q=80"
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

        {/* ================= FEATURES ================= */}
        <section className="py-20 sm:py-24 bg-white border-y border-[#E4E8DC]" id="features">
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

        {/* ================= HOW IT WORKS ================= */}
        <section className="py-20 sm:py-24" id="how">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-end mb-14">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
                  How It Works
                </span>
                <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-[#10241A]">
                  From leaf to verified report
                  <br />
                  in three steps
                </h2>
              </div>
              <div>
                <p className="text-[#5C6B60] text-base leading-relaxed">
                  The fusion engine keeps the loop fast: confident cases skip the queue entirely, while ambiguous ones get a human expert&apos;s eye.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="bg-white border border-[#E4E8DC] rounded-3xl p-7 relative">
                <span className="font-['Instrument_Serif',serif] italic text-base text-[#7FA81B] font-bold">
                  Step 01
                </span>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#10241A] mt-2.5 mb-2">
                  Capture & describe
                </h3>
                <p className="text-[#5C6B60] text-sm leading-relaxed">
                  Upload a leaf photo for vision-based classification, or walk through a guided symptom questionnaire for stem, bud and fruit issues.
                </p>
              </div>

              <div className="bg-white border border-[#E4E8DC] rounded-3xl p-7 relative">
                <span className="font-['Instrument_Serif',serif] italic text-base text-[#7FA81B] font-bold">
                  Step 02
                </span>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#10241A] mt-2.5 mb-2">
                  AI fusion analysis
                </h3>
                <p className="text-[#5C6B60] text-sm leading-relaxed">
                  Confidence from the image and the questionnaire is combined. High-agreement results are auto-verified instantly.
                </p>
              </div>

              <div className="bg-white border border-[#E4E8DC] rounded-3xl p-7 relative">
                <span className="font-['Instrument_Serif',serif] italic text-base text-[#7FA81B] font-bold">
                  Step 03
                </span>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#10241A] mt-2.5 mb-2">
                  Verify, advise & alert
                </h3>
                <p className="text-[#5C6B60] text-sm leading-relaxed">
                  Officers review edge cases, add expert advice, and trigger radius-based alerts to nearby farmers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MAP (DARK) ================= */}
        <section className="py-20 sm:py-24 bg-[#123524] text-white" id="map">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-9">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C9F169] mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#C9F169]" />
                  Live Disease Heatmap
                </span>
                <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
                  See outbreaks before
                  <br />
                  they reach your gate
                </h2>
                <p className="text-[#AEC0A6] text-base max-w-xl leading-relaxed">
                  Verified and suspected cases, mapped across the Coconut Triangle. Try it — drag, zoom, tap the markers.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-bold bg-[#C9F169]/15 border border-[#C9F169]/30 text-[#C9F169] px-4 py-2 rounded-full self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-[#C9F169] animate-ping" />
                Live · syncs every 5 min
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0C281B]">
              <DiseaseLeafletMap />

              {/* Map Legend */}
              <div className="absolute left-4 bottom-4 z-[500] bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#10241A] shadow-md">
                <span className="flex items-center gap-2">
                  <i className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
                  Verified outbreak
                </span>
                <span className="flex items-center gap-2">
                  <i className="w-2.5 h-2.5 rounded-full bg-[#F5A524]" />
                  Suspected
                </span>
                <span className="flex items-center gap-2">
                  <i className="w-2.5 h-2.5 rounded-full bg-[#3DA35D]" />
                  Cleared
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-[#8FA68B]">
              Showing live regional field telemetry. In production, markers reflect officer-verified reports and suspected cases streamed in real time.
            </p>
          </div>
        </section>

        {/* ================= ROLES ================= */}
        <section className="py-20 sm:py-24" id="roles">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
                Role-Based Access
              </span>
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-[#10241A] max-w-xl mx-auto">
                One platform, three purpose-built dashboards
              </h2>
            </div>

            {/* Role Tabs */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-[#E7EDDB] rounded-full p-1.5 gap-1 shadow-inner">
                {(['farmer', 'officer', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveRole(role)}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 capitalize ${
                      activeRole === role
                        ? 'bg-[#123524] text-white shadow-md'
                        : 'text-[#5C6B60] hover:text-[#10241A]'
                    }`}
                  >
                    {role === 'farmer' && (
                      <span className="inline-flex items-center gap-1.5">
                        <Sprout className="h-4 w-4" /> Farmer
                      </span>
                    )}
                    {role === 'officer' && (
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" /> Officer
                      </span>
                    )}
                    {role === 'admin' && (
                      <span className="inline-flex items-center gap-1.5">
                        <Settings className="h-4 w-4" /> Admin
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Panels */}
            <div className="min-h-[380px]">
              {/* Farmer Panel */}
              {activeRole === 'farmer' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center"
                >
                  <div>
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-3xl font-bold text-[#10241A] mb-3">
                      The Farmer workspace
                    </h3>
                    <p className="text-[#5C6B60] text-base mb-6 leading-relaxed">
                      Everything a grower needs day-to-day — diagnose, learn, track and plan, all from{' '}
                      <code className="bg-[#EDF3E0] px-2 py-0.5 rounded text-sm text-[#123524] font-semibold">
                        /app
                      </code>.
                    </p>
                    <ul className="space-y-3.5 mb-8">
                      {[
                        'Run AI leaf diagnoses and symptom questionnaires',
                        'Chat with the CRI-grounded assistant, citations included',
                        'Track every report from submission to verified outcome',
                        'Watch local weather and the regional outbreak map',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-[#10241A]">
                          <span className="w-5 h-5 rounded-full bg-[#C9F169] text-[#0C281B] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/app"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#123524] text-white text-sm font-semibold hover:bg-[#0C281B] transition-all"
                    >
                      Open Farmer Dashboard <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="bg-white border border-[#E4E8DC] rounded-3xl p-6 shadow-md">
                    <div className="flex items-center justify-between font-['Bricolage_Grotesque',sans-serif] font-bold text-sm text-[#10241A] pb-3 border-b border-[#E4E8DC]">
                      <span>Diagnosis Report #1287</span>
                      <span className="text-[11px] font-bold bg-[#C9F169] text-[#0C281B] px-2.5 py-0.5 rounded-full">
                        Auto-verified
                      </span>
                    </div>
                    <div className="bg-[#F6F7F2] rounded-2xl p-4 my-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-[#10241A]">Bud Rot</div>
                        <div className="text-xs text-[#5C6B60]">Fusion confidence 94% · Photo + symptoms</div>
                      </div>
                      <span className="text-xs font-bold bg-[#EDF3E0] text-[#123524] px-2.5 py-1 rounded-full">
                        High agreement
                      </span>
                    </div>
                    <div className="flex gap-1.5 my-3">
                      <div className="h-1.5 flex-1 rounded-full bg-[#C9F169]" />
                      <div className="h-1.5 flex-1 rounded-full bg-[#C9F169]" />
                      <div className="h-1.5 flex-1 rounded-full bg-[#C9F169]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#5C6B60] font-semibold">
                      <span>Uploaded</span>
                      <span>Analyzed</span>
                      <span>Verified</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E4E8DC] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#10241A]">Officer Advice Attached</div>
                        <div className="text-[#5C6B60]">Dilani F. · 2 hours ago</div>
                      </div>
                      <span className="text-xs font-bold text-[#123524] bg-[#EDF3E0] px-2.5 py-1 rounded-full">
                        3 action steps
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Officer Panel */}
              {activeRole === 'officer' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center"
                >
                  <div>
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-3xl font-bold text-[#10241A] mb-3">
                      The Officer console
                    </h3>
                    <p className="text-[#5C6B60] text-base mb-6 leading-relaxed">
                      Agricultural officers verify edge cases and push expertise back to the field at{' '}
                      <code className="bg-[#EDF3E0] px-2 py-0.5 rounded text-sm text-[#123524] font-semibold">
                        /officer
                      </code>.
                    </p>
                    <ul className="space-y-3.5 mb-8">
                      {[
                        'Review a prioritized queue of ambiguous submissions',
                        'Verify, correct, or request more info with one tap',
                        'Add region-specific advice to every verdict',
                        'Trigger radius-based alerts to nearby farms',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-[#10241A]">
                          <span className="w-5 h-5 rounded-full bg-[#C9F169] text-[#0C281B] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/officer/reports"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#123524] text-white text-sm font-semibold hover:bg-[#0C281B] transition-all"
                    >
                      Open Officer Console <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="bg-white border border-[#E4E8DC] rounded-3xl p-6 shadow-md">
                    <div className="flex items-center justify-between font-['Bricolage_Grotesque',sans-serif] font-bold text-sm text-[#10241A] pb-3 border-b border-[#E4E8DC]">
                      <span>Review Queue</span>
                      <span className="text-[11px] font-bold bg-[#FCF0DA] text-[#8A5A00] px-2.5 py-0.5 rounded-full">
                        3 pending review
                      </span>
                    </div>
                    <div className="space-y-2.5 my-4">
                      <div className="flex items-center justify-between gap-3 bg-[#F6F7F2] p-3 rounded-xl text-xs">
                        <div className="w-8 h-8 rounded-full bg-[#5B7A46] text-white font-bold flex items-center justify-center shrink-0">
                          KP
                        </div>
                        <div className="flex-1 min-w-0">
                          <b className="text-[#10241A] truncate block">Kandy South Farm</b>
                          <span className="text-[#5C6B60]">Leaf miner · 71% confidence</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => showToast('Report marked as verified!')}
                            className="px-3 py-1 rounded-full bg-[#123524] text-white font-bold text-[11px]"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 bg-[#F6F7F2] p-3 rounded-xl text-xs">
                        <div className="w-8 h-8 rounded-full bg-[#8A6D3B] text-white font-bold flex items-center justify-center shrink-0">
                          RM
                        </div>
                        <div className="flex-1 min-w-0">
                          <b className="text-[#10241A] truncate block">Ratmalana Estate</b>
                          <span className="text-[#5C6B60]">Stem bleeding · 66% confidence</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => showToast('Review details opened')}
                            className="px-3 py-1 rounded-full border border-[#E4E8DC] text-[#5C6B60] font-bold text-[11px] bg-white"
                          >
                            Info
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 bg-[#F6F7F2] p-3 rounded-xl text-xs">
                        <div className="w-8 h-8 rounded-full bg-[#3D6B7A] text-white font-bold flex items-center justify-center shrink-0">
                          SJ
                        </div>
                        <div className="flex-1 min-w-0">
                          <b className="text-[#10241A] truncate block">Jaela Smallholding</b>
                          <span className="text-[#5C6B60]">Suspected outbreak · radius 5 km</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('Radius alert dispatched to 32 farms!')}
                          className="px-3 py-1 rounded-full bg-[#123524] text-white font-bold text-[11px]"
                        >
                          Alert
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Admin Panel */}
              {activeRole === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center"
                >
                  <div>
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-3xl font-bold text-[#10241A] mb-3">
                      The Admin console
                    </h3>
                    <p className="text-[#5C6B60] text-base mb-6 leading-relaxed">
                      Platform governance and health at a glance at{' '}
                      <code className="bg-[#EDF3E0] px-2 py-0.5 rounded text-sm text-[#123524] font-semibold">
                        /admin
                      </code>.
                    </p>
                    <ul className="space-y-3.5 mb-8">
                      {[
                        'Manage users, farms and role assignments',
                        'Moderate reports and broadcast notifications',
                        'Monitor service health — Vision, RAG, DB, Weather',
                        'Export insights across regions and seasons',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-[#10241A]">
                          <span className="w-5 h-5 rounded-full bg-[#C9F169] text-[#0C281B] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#123524] text-white text-sm font-semibold hover:bg-[#0C281B] transition-all"
                    >
                      Open Admin Portal <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="bg-white border border-[#E4E8DC] rounded-3xl p-6 shadow-md">
                    <div className="flex items-center justify-between font-['Bricolage_Grotesque',sans-serif] font-bold text-sm text-[#10241A] pb-3 border-b border-[#E4E8DC]">
                      <span>System Health</span>
                      <span className="text-[11px] font-bold bg-[#C9F169] text-[#0C281B] px-2.5 py-0.5 rounded-full">
                        All operational
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 my-3.5">
                      {['Vision API', 'RAG Service', 'PostgreSQL + pgvector', 'Weather Sync'].map((chip) => (
                        <span key={chip} className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#EDF3E0] text-[#123524] px-2.5 py-1 rounded-full">
                          <Check className="h-3 w-3 stroke-[3] text-[#7FA81B]" />
                          {chip}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between bg-[#F6F7F2] p-2.5 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#123524] text-white font-bold flex items-center justify-center text-[10px]">
                            NP
                          </div>
                          <div>
                            <b className="text-[#10241A] block">Nimal Perera</b>
                            <span className="text-[#5C6B60]">Farmer · Kurunegala · 24 reports</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#123524] bg-[#EDF3E0] px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-[#F6F7F2] p-2.5 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#7A3D3D] text-white font-bold flex items-center justify-center text-[10px]">
                            DF
                          </div>
                          <div>
                            <b className="text-[#10241A] block">Dilani Fernando</b>
                            <span className="text-[#5C6B60]">Officer · Puttalam region</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#123524] bg-[#EDF3E0] px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-[#F6F7F2] p-2.5 rounded-xl">
                        <div>
                          <b className="text-[#10241A] block">Broadcast Channel</b>
                          <span className="text-[#5C6B60]">Weather warning → 1,204 farmers</span>
                        </div>
                        <span className="text-[11px] font-bold bg-[#FCF0DA] text-[#8A5A00] px-2 py-0.5 rounded-full">
                          Queued
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS (DARK) ================= */}
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
              <div className="bg-white text-[#10241A] rounded-3xl p-8 flex flex-col justify-between shadow-xl">
                <span className="font-['Instrument_Serif',serif] text-5xl text-[#7FA81B] leading-none mb-4 block">
                  &ldquo;
                </span>
                <p className="text-base text-[#37473C] leading-relaxed mb-6">
                  The app flagged Bud Rot on a tree I thought was perfectly fine. I caught it two weeks early and saved the whole cluster. That one alert paid for my phone.
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E4E8DC]">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5B7A46] to-[#8FB563] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    NP
                  </div>
                  <div>
                    <b className="font-['Bricolage_Grotesque',sans-serif] text-[#10241A] block">Nimal Perera</b>
                    <span className="text-xs text-[#5C6B60]">Farmer · Kurunegala</span>
                  </div>
                </div>
              </div>

              <div className="bg-white text-[#10241A] rounded-3xl p-8 flex flex-col justify-between shadow-xl">
                <span className="font-['Instrument_Serif',serif] text-5xl text-[#7FA81B] leading-none mb-4 block">
                  &ldquo;
                </span>
                <p className="text-base text-[#37473C] leading-relaxed mb-6">
                  Fusion-verified reports mean I only review what truly needs a human eye. Outbreak alerts that used to take weeks now reach nearby farms in minutes.
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E4E8DC]">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7A5B3D] to-[#B08D5B] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    DF
                  </div>
                  <div>
                    <b className="font-['Bricolage_Grotesque',sans-serif] text-[#10241A] block">Dilani Fernando</b>
                    <span className="text-xs text-[#5C6B60]">Agricultural Officer · Puttalam</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INSIGHTS ================= */}
        <section className="py-20 sm:py-24" id="insights">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
                Blog
              </span>
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-[#10241A]">
                Insights & stories from the field
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article className="bg-white border border-[#E4E8DC] rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#DCEBC4] to-[#9CC069]">
                  <img
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80"
                    alt="Hands planting a young seedling"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-7">
                  <span className="inline-flex text-[11px] font-bold bg-[#EDF3E0] text-[#123524] px-2.5 py-0.5 rounded-full mb-3">
                    Field Guide
                  </span>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#10241A] mb-2">
                    5 early signs of Bud Rot every grower should know
                  </h3>
                  <p className="text-[#5C6B60] text-sm leading-relaxed mb-4">
                    From spear-leaf discoloration to a rotten smell at the crown — spot it early with this illustrated checklist from CRI manuals.
                  </p>
                  <button
                    type="button"
                    onClick={() => showToast('Article coming soon — stay tuned!')}
                    className="inline-flex items-center gap-1.5 font-semibold text-sm text-[#123524] hover:text-[#7FA81B] transition-colors"
                  >
                    Read article <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>

              <article className="bg-white border border-[#E4E8DC] rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#DCEBC4] to-[#9CC069]">
                  <img
                    src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80"
                    alt="Fresh green coconut leaves"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-7">
                  <span className="inline-flex text-[11px] font-bold bg-[#EDF3E0] text-[#123524] px-2.5 py-0.5 rounded-full mb-3">
                    Behind the Scenes
                  </span>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#10241A] mb-2">
                    How RAG keeps our AI grounded in CRI science
                  </h3>
                  <p className="text-[#5C6B60] text-sm leading-relaxed mb-4">
                    A look inside the retrieval pipeline: Gemini embeddings, pgvector search and why answers cite their source circulars — always.
                  </p>
                  <button
                    type="button"
                    onClick={() => showToast('Article coming soon — stay tuned!')}
                    className="inline-flex items-center gap-1.5 font-semibold text-sm text-[#123524] hover:text-[#7FA81B] transition-colors"
                  >
                    Read article <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
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
                {[
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
                ].map((item, index) => {
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

        {/* ================= CTA ================= */}
        <section className="py-16 sm:py-20" id="cta">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="relative rounded-[32px] overflow-hidden p-10 sm:p-16 text-center text-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1800&q=80"
                alt="Plantation backdrop"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0C281B]/80 via-[#0C281B]/90 to-[#0C281B]/95" />

              <div className="relative z-10 max-w-xl mx-auto">
                <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-5xl font-bold tracking-tight mb-4">
                  Protect your grove this season
                </h2>
                <p className="text-[#C4D4BB] text-base sm:text-lg mb-8">
                  Join the growers and officers already diagnosing faster with Coco Care.
                </p>

                <form onSubmit={handleCtaSubmit} className="flex flex-col sm:flex-row gap-2 bg-white/10 border border-white/25 p-2 rounded-2xl sm:rounded-full backdrop-blur-md mb-4">
                  <input
                    type="text"
                    value={ctaInput}
                    onChange={(e) => setCtaInput(e.target.value)}
                    placeholder="Enter your email or phone"
                    required
                    className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-[#B9C9B4] outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-[#C9F169] text-[#0C281B] font-semibold text-sm hover:bg-[#d8fa7e] transition-all shadow-sm shrink-0"
                  >
                    Get Early Access
                  </button>
                </form>
                <div className="text-xs text-[#AEC0A6] flex items-center justify-center gap-2">
                  <span>Already have an account?</span>
                  <Link to="/login" className="text-[#C9F169] font-bold hover:underline">
                    Sign in here
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#0C281B] text-[#AEC0A6] text-sm">
        <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div>
              <a href="#top" className="flex items-center gap-2.5 font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-white mb-4">
                <span className="w-9 h-9 rounded-xl bg-[#1B4A31] flex items-center justify-center text-[#C9F169]">
                  <Palmtree className="h-5 w-5 text-[#C9F169]" />
                </span>
                <span>Coco Care</span>
              </a>
              <p className="text-xs sm:text-sm text-[#8B9689] max-w-xs leading-relaxed mb-6">
                Sustainable coconut farming for a better tomorrow — AI care for every palm in Sri Lanka.
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-[#C4D4BB] hover:bg-[#C9F169] hover:text-[#0C281B] hover:border-[#C9F169] transition-all"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-[#C4D4BB] hover:bg-[#C9F169] hover:text-[#0C281B] hover:border-[#C9F169] transition-all"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-[#C4D4BB] hover:bg-[#C9F169] hover:text-[#0C281B] hover:border-[#C9F169] transition-all"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-['Bricolage_Grotesque',sans-serif] font-semibold text-white mb-4 text-sm">
                Product
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link to="/app" className="hover:text-[#C9F169] transition-colors">Farmer App</Link></li>
                <li><Link to="/officer/reports" className="hover:text-[#C9F169] transition-colors">Officer Console</Link></li>
                <li><Link to="/admin" className="hover:text-[#C9F169] transition-colors">Admin Console</Link></li>
                <li><a href="#map" className="hover:text-[#C9F169] transition-colors">Disease Heatmap</a></li>
                <li><a href="#features" className="hover:text-[#C9F169] transition-colors">CRI Chatbot</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-['Bricolage_Grotesque',sans-serif] font-semibold text-white mb-4 text-sm">
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><a href="#insights" className="hover:text-[#C9F169] transition-colors">Field Guides</a></li>
                <li><a href="#faq" className="hover:text-[#C9F169] transition-colors">FAQ</a></li>
                <li><Link to="/login" className="hover:text-[#C9F169] transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-[#C9F169] transition-colors">Create Account</Link></li>
                <li><a href="#" className="hover:text-[#C9F169] transition-colors">CRI Circulars</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-['Bricolage_Grotesque',sans-serif] font-semibold text-white mb-4 text-sm">
                Contact
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><a href="mailto:hello@cococare.lk" className="hover:text-[#C9F169] transition-colors">hello@cococare.lk</a></li>
                <li><a href="tel:+94112345678" className="hover:text-[#C9F169] transition-colors">+94 11 234 5678</a></li>
                <li>Coconut Triangle,<br />Kurunegala, Sri Lanka</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7C8F79]">
            <span>&copy; {new Date().getFullYear()} Coco Care. All rights reserved.</span>
            <span className="inline-flex items-center gap-1.5">
              Grounded in CRI research · Built for the field
              <Palmtree className="h-3.5 w-3.5 text-[#C9F169]" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}