import { Outlet, Link, useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  Microscope,
  MessageSquare,
  Map,
  Bell,
  User,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Phone,
  Mail,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CocoCareLogo } from '@/app/components/CocoCareLogo'

const navigation = [
  { name: 'Dashboard', shortName: 'Home', href: '/app', icon: LayoutDashboard },
  {
    name: 'Coconut Disease Diagnosis',
    shortName: 'Diagnose',
    href: '/app/disease-detection',
    icon: Microscope,
  },
  { name: 'AI Chatbot', shortName: 'Chat', href: '/app/chatbot', icon: MessageSquare },
  { name: 'Heatmap', shortName: 'Map', href: '/app/heatmap', icon: Map },
  { name: 'Notifications', shortName: 'Alerts', href: '/app/notifications', icon: Bell },
  { name: 'Profile', shortName: 'Profile', href: '/app/profile', icon: User },
]

function isNavActive(pathname: string, href: string) {
  if (href === '/app') return pathname === '/app'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const sidebarWide = !collapsed

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    setMobileDrawerOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!mobileDrawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileDrawerOpen])

  const bottomNav = navigation.filter((item) =>
    ['/app', '/app/disease-detection', '/app/chatbot', '/app/heatmap', '/app/profile'].includes(
      item.href,
    ),
  )

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col shrink-0 bg-white border-r border-green-100
          transition-[width] duration-300 ease-in-out overflow-hidden
          ${collapsed ? 'w-[4.5rem]' : 'w-64'}
        `}
      >
        <div
          className={`border-b border-green-100 flex items-center p-3 shrink-0 min-h-[3.75rem] ${
            sidebarWide ? 'justify-end' : 'justify-center'
          }`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="min-h-11 min-w-11 p-2.5 rounded-xl text-gray-700 hover:bg-green-50 hover:text-[#2d5f2e] transition-all"
            aria-label={sidebarWide ? 'Collapse navigation' : 'Expand navigation'}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
          {navigation.map((item) => {
            const active = isNavActive(location.pathname, item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                title={sidebarWide ? undefined : item.name}
                className={`
                  flex items-center gap-3 rounded-xl transition-all duration-200 min-h-11
                  ${sidebarWide ? 'px-4 py-3' : 'justify-center px-0 py-3'}
                  ${
                    active
                      ? 'bg-[#2d5f2e] text-white shadow-md shadow-green-900/10'
                      : 'text-gray-700 hover:bg-green-50 hover:text-[#2d5f2e]'
                  }
                `}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    sidebarWide ? 'max-w-[12rem] opacity-100' : 'max-w-0 overflow-hidden opacity-0'
                  }`}
                >
                  {item.name}
                </span>
                {active && sidebarWide ? (
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
                ) : null}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
          aria-label="Close menu"
          onClick={() => setMobileDrawerOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex h-16 items-center justify-between border-b border-green-100 px-4">
            <CocoCareLogo to="/app" iconClassName="h-7 w-auto max-w-[120px] object-contain" />
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-700 hover:bg-green-50"
              aria-label="Close navigation"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navigation.map((item) => {
              const active = isNavActive(location.pathname, item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#2d5f2e] text-white shadow-md'
                      : 'text-gray-800 hover:bg-green-50 hover:text-[#2d5f2e]'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-green-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </div>
        </aside>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-green-100 bg-white px-3 sm:h-16 sm:px-4 lg:px-6"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-700 hover:bg-green-50 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-6 w-6" />
            </button>
            <CocoCareLogo
              to="/app"
              iconClassName="h-7 w-auto max-w-[110px] object-contain sm:h-8 sm:max-w-[130px]"
            />
          </div>

          <div className="relative shrink-0" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex min-h-11 items-center gap-2 rounded-full border border-transparent p-1.5 pr-2 transition-all hover:border-green-100 hover:bg-green-50 sm:pr-3"
              aria-expanded={profileOpen}
              aria-label="Account menu"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8b6f47] to-[#6b5537] text-sm font-medium text-white">
                {initials}
              </div>
              <span className="hidden max-w-[8rem] truncate text-sm font-medium text-gray-800 md:block">
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            <div
              className={`absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-1.5rem))] origin-top-right rounded-2xl border border-green-100 bg-white shadow-xl transition-all duration-200 ${
                profileOpen
                  ? 'pointer-events-auto scale-100 opacity-100'
                  : 'pointer-events-none scale-95 opacity-0'
              }`}
            >
              <div className="border-b border-gray-100 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-gray-900">{user?.name}</div>
                    <div className="truncate text-xs text-gray-500 capitalize">
                      @{user?.username} · {user?.role}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 p-4 text-sm">
                {user?.phone ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 shrink-0 text-[#2d5f2e]" />
                    <span className="truncate">{user.phone}</span>
                  </div>
                ) : null}
                {user?.email ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 shrink-0 text-[#2d5f2e]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-1 border-t border-gray-100 p-3">
                <Link
                  to="/app/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-green-50"
                >
                  <User className="h-4 w-4" />
                  View profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-4 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-green-100 bg-white/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 pt-1">
          {bottomNav.map((item) => {
            const active = isNavActive(location.pathname, item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors sm:text-[11px] ${
                  active ? 'text-[#2d5f2e]' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    active ? 'bg-green-50 text-[#2d5f2e]' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className="truncate max-w-full">{item.shortName}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Compact FAB — hide on chat (covers composer) and when already on diagnosis hub */}
      {!location.pathname.startsWith('/app/chatbot') &&
      location.pathname !== '/app/disease-detection' &&
      !location.pathname.startsWith('/app/disease-detection/') ? (
        <Link
          to="/app/disease-detection"
          className="fixed z-30 flex items-center gap-2 rounded-full bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 px-3.5 py-3.5 sm:bottom-6 sm:right-6 sm:px-5 sm:py-4 lg:bottom-6"
          aria-label="Coco Disease Diagnosis"
        >
          <Microscope className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="hidden pr-1 text-sm font-medium sm:inline">Coco Disease Diagnosis</span>
        </Link>
      ) : null}
    </div>
  )
}
