import { Link } from 'react-router'
import { Twitter, Linkedin, Youtube } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="relative text-[#10241A] text-sm overflow-hidden border-t border-[#E4E8DC]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/34ec78ae0ab34927ea8e9cf17c713ba5.jpg"
          alt="Scenic green landscape"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-50 pb-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#10241A]/15">
          <div>
            <a href="#top" className="flex items-center gap-2.5 font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#10241A] mb-4">
              <span className="w-9 h-9 rounded-xl bg-[#123524] flex items-center justify-center text-[#C9F169] shadow-sm">
                <img src="/new logo.svg" alt="Coco Care logo" className="h-5 w-5 object-contain" />
              </span>
              <span>Coco Care</span>
            </a>
            <p className="text-xs sm:text-sm text-[#1E382B] max-w-xs leading-relaxed mb-6 font-medium">
              Sustainable coconut farming for a better tomorrow — AI care for every palm in Sri Lanka.
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full border border-[#10241A]/20 bg-white/50 backdrop-blur-sm flex items-center justify-center text-[#10241A] hover:bg-[#123524] hover:text-[#C9F169] hover:border-[#123524] transition-all shadow-sm"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-[#10241A]/20 bg-white/50 backdrop-blur-sm flex items-center justify-center text-[#10241A] hover:bg-[#123524] hover:text-[#C9F169] hover:border-[#123524] transition-all shadow-sm"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-[#10241A]/20 bg-white/50 backdrop-blur-sm flex items-center justify-center text-[#10241A] hover:bg-[#123524] hover:text-[#C9F169] hover:border-[#123524] transition-all shadow-sm"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[#10241A] mb-4 text-sm">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li><Link to="/app" className="text-[#1E382B] hover:text-[#10241A] transition-colors">Farmer App</Link></li>
              <li><Link to="/officer" className="text-[#1E382B] hover:text-[#10241A] transition-colors">Officer Console</Link></li>
              <li><Link to="/admin" className="text-[#1E382B] hover:text-[#10241A] transition-colors">Admin Console</Link></li>
              <li><a href="#map" className="text-[#1E382B] hover:text-[#10241A] transition-colors">Disease Heatmap</a></li>
              <li><a href="#features" className="text-[#1E382B] hover:text-[#10241A] transition-colors">CRI Chatbot</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[#10241A] mb-4 text-sm">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li><a href="#blog" className="text-[#1E382B] hover:text-[#10241A] transition-colors">Blog</a></li>
              <li><a href="#blog" className="text-[#1E382B] hover:text-[#10241A] transition-colors">Field Guides</a></li>
              <li><a href="#faq" className="text-[#1E382B] hover:text-[#10241A] transition-colors">FAQ</a></li>
              <li><Link to="/login" className="text-[#1E382B] hover:text-[#10241A] transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-[#1E382B] hover:text-[#10241A] transition-colors">Create Account</Link></li>
              <li><a href="#" className="text-[#1E382B] hover:text-[#10241A] transition-colors">CRI Circulars</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[#10241A] mb-4 text-sm">
              <a href="#contact" className="hover:text-[#123524] transition-colors">Contact Us</a>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li><a href="mailto:hello@cococare.lk" className="text-[#1E382B] hover:text-[#10241A] transition-colors">hello@cococare.lk</a></li>
              <li><a href="tel:+94112345678" className="text-[#1E382B] hover:text-[#10241A] transition-colors">+94 11 234 5678</a></li>
              <li className="text-[#1E382B]">Coconut Triangle,<br />Kurunegala, Sri Lanka</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1E382B] font-medium">
          <span>&copy; {new Date().getFullYear()} Coco Care. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5">
            Grounded in CRI research &middot; Built for the field
            <span className="w-5 h-5 rounded-md bg-[#123524] flex items-center justify-center p-0.5">
              <img src="/new logo.svg" alt="Coco Care logo" className="h-3 w-3 object-contain" />
            </span>
          </span>
        </div>
      </div>
    </footer>
  )
}

