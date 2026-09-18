import { Link } from 'react-router'
import { Palmtree, Twitter, Linkedin, Youtube } from 'lucide-react'

export function LandingFooter() {
  return (
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
  )
}
