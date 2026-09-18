import { Link } from 'react-router'
import { House, ScanLine, Map, MessageCircle } from 'lucide-react'

function isNavActive(pathname: string, href: string) {
  if (href === '/app') return pathname === '/app'
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface MobileBottomNavProps {
  locationPath: string
}

export function MobileBottomNav({ locationPath }: MobileBottomNavProps) {
  const mobileBottomNav = [
    { name: 'Home', href: '/app', icon: House },
    { name: 'Diagnose', href: '/app/disease-detection', icon: ScanLine },
    { name: 'Heat Map', href: '/app/heatmap', icon: Map },
    { name: 'CocoBot', href: '/app/chatbot', icon: MessageCircle },
  ]

  return (
    <nav
      className="fixed bottom-4 inset-x-4 max-w-[390px] mx-auto h-[64px] bg-white rounded-full flex items-center p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.08)] border border-[#E4E8DC] z-40 lg:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary navigation"
    >
      {mobileBottomNav.map((item) => {
        const active = isNavActive(locationPath, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`
              flex items-center justify-center transition-all duration-200
              ${
                active
                  ? 'bg-[#224A22] text-white px-5 py-2.5 rounded-full gap-2 font-bold shadow-xs shrink-0'
                  : 'text-[#8FA090] hover:text-[#224A22] p-2.5 rounded-full flex-1 flex justify-center active:scale-90'
              }
            `}
          >
            <Icon
              className="h-[20px] w-[20px] shrink-0"
              strokeWidth={active ? 2.1 : 1.8}
            />
            {active && (
              <span className="text-[14px] font-bold text-white leading-none tracking-wide whitespace-nowrap">
                {item.name}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
