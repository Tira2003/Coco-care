import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, Menu, X } from 'lucide-react'

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how' },
    { label: 'Roles', href: '#roles' },
  ]

  return (
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
            <img src="/new logo.svg" alt="Coco Care logo" className="h-5 w-5 object-contain" />
          </span>
          <span>Coco Care</span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
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
            {navLinks.map((link) => (
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
  )
}
