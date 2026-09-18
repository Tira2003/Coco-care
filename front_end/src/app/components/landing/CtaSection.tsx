import { useState } from 'react'
import { Link } from 'react-router'

interface CtaSectionProps {
  showToast: (msg: string) => void
}

export function CtaSection({ showToast }: CtaSectionProps) {
  const [ctaInput, setCtaInput] = useState('')

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctaInput.trim()) return
    showToast("Thanks! We'll be in touch within 24 hours. 🌴")
    setCtaInput('')
  }

  return (
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

            <form
              onSubmit={handleCtaSubmit}
              className="flex flex-col sm:flex-row gap-2 bg-white/10 border border-white/25 p-2 rounded-2xl sm:rounded-full backdrop-blur-md mb-4"
            >
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
  )
}
