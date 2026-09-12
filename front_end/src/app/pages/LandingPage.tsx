import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Scan,
  MessageSquare,
  Map,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Star,
  Check,
  Users,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { LandingLogo } from '@/app/components/LandingLogo'

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1590487527083-c8236d53dea0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjb2NvbnV0JTIwcGFsbSUyMHBsYW50YXRpb24lMjB0cm9waWNhbCUyMFNyaSUyMExhbmthfGVufDF8fHx8MTc4MzE0NTY4NHww&ixlib=rb-4.1.0&q=80&w=1920";
const LEAF_IMAGE =
  "https://images.unsplash.com/photo-1759579726616-8205b10f59c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjb2NvbnV0JTIwbGVhZiUyMGRpc2Vhc2UlMjBkZXRlY3Rpb24lMjBjbG9zZSUyMHVwfGVufDF8fHx8MTc4MzE0NTY4OHww&ixlib=rb-4.1.0&q=80&w=1080";
const PALM_IMAGE =
  "https://images.unsplash.com/photo-1657811763824-8f42e2d5c657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxjb2NvbnV0JTIwcGFsbSUyMHBsYW50YXRpb24lMjB0cm9waWNhbCUyMFNyaSUyMExhbmthfGVufDF8fHx8MTc4MzE0NTY4NHww&ixlib=rb-4.1.0&q=80&w=1080";
const FIELD_IMAGE =
  "https://images.unsplash.com/photo-1678078476300-aa5291ea8c41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjb2NvbnV0JTIwcGFsbSUyMHBsYW50YXRpb24lMjB0cm9waWNhbCUyMFNyaSUyMExhbmthfGVufDF8fHx8MTc4MzE0NTY4NHww&ixlib=rb-4.1.0&q=80&w=1080";

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen overflow-x-hidden bg-white">

      {/* ── NAV ── */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-green-100 bg-white/95 shadow-sm backdrop-blur-md" : "bg-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-8">
          <LandingLogo to="/" light={!scrolled} />

          <div className="hidden items-center gap-7 md:flex">
            {[["Features", "#features"], ["How It Works", "#how-it-works"], ["About", "#about"]].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className={`text-sm font-medium transition-colors hover:opacity-80 ${scrolled ? "text-[#2d5016]" : "text-white/90"}`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${scrolled ? "text-[#2d5016] hover:bg-green-50" : "text-white/85 hover:text-white"}`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-[#f4a460] px-5 py-2.5 text-sm font-bold text-[#1a2e0a] shadow-sm transition-all hover:bg-[#e8935a]"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen
              ? <X size={22} className={scrolled ? "text-[#2d5016]" : "text-white"} />
              : <Menu size={22} className={scrolled ? "text-[#2d5016]" : "text-white"} />
            }
          </button>
        </div>

        {menuOpen && (
          <div className="space-y-1 border-t border-green-100 bg-white px-4 py-4 shadow-md md:hidden">
            {[["Features", "#features"], ["How It Works", "#how-it-works"], ["About", "#about"]].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="block min-h-11 rounded-xl px-3 py-3 text-sm font-medium text-[#2d5016] hover:bg-green-50"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <Link to="/login" className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#2d5016] text-sm text-[#2d5016]">Sign In</Link>
              <Link to="/register" className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#2d5016] text-sm font-bold text-white">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex min-h-[100svh] min-h-[100dvh] items-center overflow-hidden pt-[env(safe-area-inset-top)]">
        <img src={HERO_IMAGE} alt="Coconut plantation" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f05]/88 via-[#1a3d0a]/75 to-[#2d5016]/50" />
        {/* Bottom wave */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 sm:h-auto">
            <path d="M0,40 C320,72 960,8 1440,40 L1440,72 L0,72 Z" fill="white" />
          </svg>
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/22 bg-white/12 px-3 py-1.5 backdrop-blur-sm sm:mb-7 sm:px-4"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#f4a460] animate-pulse" />
              <span className="truncate text-[11px] font-medium tracking-wide text-white/88 sm:text-xs">
                AI-Powered Coconut Farming Platform · Sri Lanka
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-4 leading-tight text-white sm:mb-5"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 8vw, 4rem)",
                lineHeight: 1.12,
              }}
            >
              AI Powered Coconut
              <br />
              <span style={{ color: "#f4a460" }}>Farmer Supporting</span>
              <br />
              System
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mb-7 max-w-lg text-base leading-relaxed text-white/68 sm:mb-9 sm:text-lg"
            >
              Helping coconut farmers detect diseases, monitor risks, and improve
              plantation management using Artificial Intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36 }}
              className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4"
            >
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f4a460] px-7 py-3.5 text-sm font-bold text-[#1a2e0a] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[#e8935a]"
              >
                Get Started <ArrowRight size={15} />
              </Link>
              <a
                href="#features"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/28 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/18"
              >
                Learn More
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.52 }}
              className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10 sm:gap-5"
            >
              <div className="flex -space-x-2">
                {["#4a7c2e", "#7ab348", "#2d5016", "#f4a460"].map((c, i) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 text-xs font-bold text-white"
                    style={{ backgroundColor: c }}>
                    {["P", "A", "K", "S"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-0.5 flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-[#f4a460] text-[#f4a460]" />)}
                </div>
                <p className="text-xs text-white/60">Trusted by 10,000+ Sri Lankan farmers</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-b border-green-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8 md:divide-x md:divide-green-100">
            {[
              { icon: <Users size={18} />, value: "10,000+", label: "Farmers Registered" },
              { icon: <TrendingUp size={18} />, value: "25,000+", label: "Diseases Detected" },
              { icon: <Award size={18} />, value: "95%", label: "AI Accuracy Rate" },
              { icon: <Target size={18} />, value: "150+", label: "Risk Zones Monitored" },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.08} className="px-2 text-center sm:px-4">
                <div className="mb-2 flex justify-center text-[#2d5016]">{s.icon}</div>
                <div className="mb-1 text-2xl font-bold text-[#2d5016] sm:text-3xl" style={{ fontFamily: "'Fraunces', serif" }}>{s.value}</div>
                <div className="text-[11px] text-[#6b7c6b] sm:text-xs">{s.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-[#f8faf6] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <FadeIn className="mb-10 text-center sm:mb-14">
            <span className="mb-4 inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-[#2d5016]">
              Platform Features
            </span>
            <h2
              className="mb-3 text-[#1a2e0a]"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.6rem)", lineHeight: 1.15 }}
            >
              Everything you need to grow
            </h2>
            <p className="mx-auto max-w-md text-sm text-[#6b7c6b]">
              Advanced AI tools purpose-built for coconut farming challenges in Sri Lanka.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.07}>
                <FeatureCard {...feat} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Image collage — scales for mobile */}
            <FadeIn className="relative mx-auto h-[300px] w-full max-w-md sm:h-[400px] lg:mx-0 lg:h-[480px] lg:max-w-none">
              <img
                src={PALM_IMAGE}
                alt="Coconut palm"
                className="absolute top-0 left-0 h-52 w-40 rounded-2xl object-cover shadow-2xl sm:h-80 sm:w-64 sm:rounded-3xl"
              />
              <img
                src={LEAF_IMAGE}
                alt="Leaf analysis"
                className="absolute right-0 bottom-0 h-40 w-36 rounded-2xl border-4 border-white object-cover shadow-xl sm:h-64 sm:w-56 sm:rounded-3xl"
              />
              {/* Floating AI result card */}
              <div className="absolute top-[42%] left-[28%] min-w-[9.5rem] rounded-2xl border border-green-100 bg-white p-3 shadow-2xl sm:left-[34%] sm:min-w-[176px] sm:p-4">
                <div className="mb-2 flex items-center gap-2 sm:gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100 sm:h-9 sm:w-9">
                    <Check size={16} className="text-[#2d5016]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#6b7c6b]">ML Diagnosis</div>
                    <div className="text-[11px] font-bold text-[#1a2e0a] sm:text-xs">Leaf disease detected</div>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-green-100">
                  <div className="h-full w-[92%] rounded-full bg-[#2d5016]" />
                </div>
                <div className="mt-0.5 text-right text-[10px] font-bold text-[#2d5016]">92% confidence</div>
              </div>
            </FadeIn>

            {/* Steps */}
            <div>
              <FadeIn>
                <span className="mb-5 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-[#8b4513]">
                  How It Works
                </span>
                <h2
                  className="mb-6 text-[#1a2e0a] sm:mb-8"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.18 }}
                >
                  Three steps to smarter
                  <br className="hidden sm:block" />
                  {" "}coconut farming
                </h2>
              </FadeIn>

              <div className="space-y-6 sm:space-y-7">
                {steps.map((step, i) => (
                  <FadeIn key={step.title} delay={i * 0.1}>
                    <div className="flex gap-4 sm:gap-5">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#2d5016] text-sm font-bold text-white shadow-md">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="mb-1 text-base font-semibold text-[#1a2e0a]">{step.title}</h3>
                        <p className="text-sm leading-relaxed text-[#6b7c6b]">{step.description}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.35}>
                <Link
                  to="/register"
                  className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2d5016] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1a3a10] hover:shadow-lg sm:mt-9 sm:w-auto"
                >
                  Start Free Today <ChevronRight size={15} />
                </Link>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="about"
        className="relative overflow-hidden py-16 sm:py-24"
        style={{ background: "linear-gradient(135deg, #0a1f05 0%, #2d5016 65%, #3d6b22 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${FIELD_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
          <FadeIn className="mb-10 text-center sm:mb-14">
            <span className="mb-5 inline-block rounded-full bg-white/12 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-white/80">
              Farmer Stories
            </span>
            <h2
              className="mb-3 text-white"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.6rem)" }}
            >
              Farmers love CocoCare
            </h2>
            <p className="mx-auto max-w-md text-sm text-green-200/70">
              From Kurunegala to Chilaw, farmers are protecting their harvests with AI-powered insights.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="rounded-3xl border border-white/14 bg-white/8 p-6 backdrop-blur-sm sm:p-7">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, j) => <Star key={j} size={13} className="fill-[#f4a460] text-[#f4a460]" />)}
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-white/75">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: t.color }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-green-300/60">{t.location}, Sri Lanka</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#f8faf6] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-5">
          <FadeIn>
            <span className="mb-6 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-[#8b4513]">
              Free to Join
            </span>
            <h2
              className="mb-4 text-[#1a2e0a]"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.75rem, 4.5vw, 3rem)", lineHeight: 1.12 }}
            >
              Ready to transform
              <br />
              your plantation?
            </h2>
            <p className="mx-auto mb-8 max-w-sm text-sm text-[#6b7c6b] sm:mb-9">
              Join thousands of coconut farmers already growing smarter with AI. No credit card required.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2d5016] px-9 py-4 text-sm font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[#1a3a10]"
              >
                Create Free Account <ArrowRight size={15} />
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#2d5016] px-9 py-4 text-sm font-semibold text-[#2d5016] transition-all hover:bg-green-50"
              >
                Sign In
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0f2208] text-white" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-8 sm:pt-16">
          <div className="mb-10 grid grid-cols-2 gap-8 sm:mb-12 md:grid-cols-4 md:gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <LandingLogo light to="/" variant="footer" allWhite />
              </div>
              <p className="text-sm leading-relaxed text-green-300/55">
                AI-powered coconut farming support platform for Sri Lankan farmers.
              </p>
            </div>
            {[
              { title: "Platform", links: ["Disease Detection", "AI Chatbot", "Disease Heatmap", "Farm Analytics", "Fertilizer Planner"] },
              { title: "Resources", links: ["Disease Guide", "Best Practices", "Agricultural Research", "Blog", "Support"] },
              { title: "Company", links: ["About Us", "Our Mission", "Contact", "Privacy Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-green-400/60">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-green-300/55 transition-colors hover:text-white">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-green-900/60 pt-6 sm:flex-row">
            <p className="text-center text-xs text-green-500/50 sm:text-left">&copy; 2026 CocoCare. All rights reserved.</p>
            <p className="text-center text-xs text-green-600/40 sm:text-right">Made with care for Sri Lankan farmers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Scan className="w-6 h-6" />,
    iconColor: "#2d5016",
    iconBg: "#e8f5e0",
    title: "AI Disease Diagnosis",
    description: "Upload a coconut leaf photo for instant disease detection and personalised treatment recommendations using deep learning.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    iconColor: "#8b4513",
    iconBg: "#fdf0e6",
    title: "Knowledge Chatbot",
    description: "Ask anything in Sinhala or English. Our AI assistant trained on Sri Lankan agricultural practices answers 24/7.",
  },
  {
    icon: <Map className="w-6 h-6" />,
    iconColor: "#1565c0",
    iconBg: "#e3f2fd",
    title: "Disease Heatmap",
    description: "Visualise active outbreaks across Sri Lanka in real-time and receive early warnings before they reach your district.",
  },
];

const steps = [
  {
    title: "Create your farm profile",
    description: "Enter your plantation details — location, tree count, soil type, and tree age — and let CocoCare personalise everything for you.",
  },
  {
    title: "Diagnose & monitor",
    description: "Upload coconut leaf images for instant AI diagnosis, or browse the live disease heatmap to stay ahead of local outbreaks.",
  },
  {
    title: "Act on AI recommendations",
    description: "Follow personalised treatment plans, fertilizer schedules, and alerts to protect your harvest and grow with confidence.",
  },
];

const testimonials = [
  {
    name: "Priya Perera",
    location: "Kurunegala",
    quote: "I caught bud rot two weeks before my neighbour noticed it. The AI scan saved nearly a quarter of my harvest this season.",
    color: "#2d5016",
  },
  {
    name: "Ajith Bandara",
    location: "Chilaw",
    quote: "The fertilizer planner cut my input costs by 20%. Recommendations are spot-on for my coastal sandy soil conditions.",
    color: "#8b4513",
  },
  {
    name: "Kumari Silva",
    location: "Gampaha",
    quote: "Being able to ask the chatbot in Sinhala is a game changer. Finally, technology that speaks my language.",
    color: "#1565c0",
  },
];

// ── FeatureCard ───────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  iconColor,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="p-6 rounded-3xl border border-transparent bg-white/50 transition-all duration-300 hover:bg-white hover:shadow-xl hover:border-green-200 hover:-translate-y-1"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-[#1a2e0a] mb-2 text-base">{title}</h3>
      <p className="text-sm text-[#6b7c6b] leading-relaxed">{description}</p>
      <div
        className="mt-4 flex items-center gap-1 text-xs font-semibold"
        style={{ color: iconColor }}
      >
        Learn more <ChevronRight size={12} />
      </div>
    </div>
  );
}