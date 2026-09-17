import { Outlet, Link, useLocation, useNavigate } from 'react-router'
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  Map,
  Bell,
  User,
  Settings,
  HelpCircle,
  Search,
  MoreHorizontal,
  PanelLeftClose,
  Menu,
  X,
  LogOut,
  Microscope,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { diseaseMapApi } from '@/api/services'

const menuNav = [
  { name: 'Dashboard', shortName: 'Home', href: '/app', icon: LayoutGrid },
  {
    name: 'Disease Diagnosis',
    shortName: 'Diagnose',
    href: '/app/disease-detection',
    icon: FileText,
  },
  { name: 'AI Chatbot', shortName: 'Chat', href: '/app/chatbot', icon: MessageSquare },
  { name: 'Disease Heatmap', shortName: 'Map', href: '/app/heatmap', icon: Map },
]

const toolsNav = [
  { name: 'Settings', href: '/app/profile', icon: Settings },
  { name: 'Help Center', href: '#help', icon: HelpCircle, isAction: true },
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
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [advisoryDismissed, setAdvisoryDismissed] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)

  const { data: diseaseAlerts = [] } = useQuery({
    queryKey: ['disease-map', 'alerts'],
    queryFn: diseaseMapApi.alerts,
  })
  const unreadAlertsCount = diseaseAlerts.filter((a) => !a.read).length || 3

  const initials = (user?.name ?? 'Akeel Bandara')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const displayName = user?.name
    ? `${user.name.split(' ')[0]} ${user.name.split(' ')[1]?.[0] ? `${user.name.split(' ')[1][0]}.` : ''}`
    : 'Akeel B.'

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
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
      setIsScrolled(false)
    }
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

  const bottomNav = [
    { name: 'Dashboard', shortName: 'Home', href: '/app', icon: LayoutGrid },
    {
      name: 'Disease Diagnosis',
      shortName: 'Diagnose',
      href: '/app/disease-detection',
      icon: FileText,
    },
    { name: 'AI Chatbot', shortName: 'Chat', href: '/app/chatbot', icon: MessageSquare },
    { name: 'Disease Heatmap', shortName: 'Map', href: '/app/heatmap', icon: Map },
    { name: 'Notifications', shortName: 'Alerts', href: '/app/notifications', icon: Bell },
  ]

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#F6F7F2]">
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col shrink-0 bg-white border-r border-[#E6EADF]
          transition-[width] duration-300 ease-in-out overflow-hidden select-none
          ${collapsed ? 'w-[4.75rem]' : 'w-64'}
        `}
      >
        {/* Brand Header & Toggle */}
        <div
          className={`flex items-center p-3 shrink-0 min-h-[4rem] border-b border-[#E6EADF] ${
            sidebarWide ? 'justify-between px-4' : 'justify-center'
          }`}
        >
          {sidebarWide ? (
            <>
              <Link to="/app" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123524] text-lg shadow-xs shrink-0">
                  🌴
                </div>
                <span className="font-['Bricolage_Grotesque',Inter,sans-serif] font-bold text-sm tracking-wider text-[#10241A] whitespace-nowrap">
                  COCO CARE
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5C6B60] hover:bg-[#F1F5EA] hover:text-[#10241A] transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse navigation"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123524] text-lg shadow-xs shrink-0 hover:scale-105 active:scale-95 transition-transform"
              title="Expand sidebar"
              aria-label="Expand navigation"
            >
              🌴
            </button>
          )}
        </div>

        {/* Search Bar */}
        {sidebarWide ? (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2 rounded-full border border-[#E6EADF] bg-[#F6F7F2] px-3.5 py-2 text-xs text-[#5C6B60] transition-colors focus-within:border-[#123524] focus-within:bg-white">
              <Search className="h-3.5 w-3.5 shrink-0 text-[#5C6B60]" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-[#10241A] placeholder-[#5C6B60] outline-none"
              />
              <span className="shrink-0 rounded-md border border-[#E6EADF] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#5C6B60]">
                ⌘S
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-2 py-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6EADF] bg-[#F6F7F2] text-[#5C6B60] hover:bg-[#F1F5EA] hover:text-[#10241A] transition-colors"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4 scrollbar-thin">
          {/* MENU Section */}
          <div>
            {sidebarWide && (
              <span className="block px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5C6B60]">
                MENU
              </span>
            )}
            <nav className="space-y-1">
              {menuNav.map((item) => {
                const active = isNavActive(location.pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    title={sidebarWide ? undefined : item.name}
                    className={`
                      flex items-center gap-3 rounded-full transition-all duration-150 min-h-10
                      ${sidebarWide ? 'px-3.5 py-2 text-xs' : 'justify-center px-0 py-2.5'}
                      ${
                        active
                          ? 'bg-[#123524] text-white font-semibold shadow-xs'
                          : 'text-[#5C6B60] hover:bg-[#F1F5EA] hover:text-[#10241A] font-medium'
                      }
                    `}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-[#5C6B60]'}`} />
                    {sidebarWide && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* TOOLS Section */}
          <div>
            {sidebarWide && (
              <span className="block px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5C6B60]">
                TOOLS
              </span>
            )}
            <nav className="space-y-1">
              {toolsNav.map((item) => {
                const active = isNavActive(location.pathname, item.href)
                if (item.isAction) {
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => alert('Coco Care Help Center: Contact agricultural extension officer or support at support@cococare.lk')}
                      title={sidebarWide ? undefined : item.name}
                      className={`
                        w-full flex items-center gap-3 rounded-full transition-all duration-150 min-h-10 text-left
                        ${sidebarWide ? 'px-3.5 py-2 text-xs' : 'justify-center px-0 py-2.5'}
                        text-[#5C6B60] hover:bg-[#F1F5EA] hover:text-[#10241A] font-medium
                      `}
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-[#5C6B60]" />
                      {sidebarWide && <span className="truncate">{item.name}</span>}
                    </button>
                  )
                }
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    title={sidebarWide ? undefined : item.name}
                    className={`
                      flex items-center gap-3 rounded-full transition-all duration-150 min-h-10
                      ${sidebarWide ? 'px-3.5 py-2 text-xs' : 'justify-center px-0 py-2.5'}
                      ${
                        active
                          ? 'bg-[#123524] text-white font-semibold shadow-xs'
                          : 'text-[#5C6B60] hover:bg-[#F1F5EA] hover:text-[#10241A] font-medium'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-[#5C6B60]" />
                    {sidebarWide && <span className="truncate">{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Season advisory card placed near bottom profile detail */}
        {!advisoryDismissed && (
          sidebarWide ? (
            <div className="mx-3 mb-2.5 rounded-[20px] bg-[#123524] p-4 text-white shadow-sm relative shrink-0">
              <div className="flex items-start justify-between">
                <span className="text-xl leading-none">🌱</span>
                <button
                  type="button"
                  onClick={() => setAdvisoryDismissed(true)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                  aria-label="Dismiss advisory"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <h4 className="font-['Bricolage_Grotesque',Inter,sans-serif] font-bold text-sm text-white mt-2">
                Season advisory
              </h4>
              <p className="mt-1 text-xs text-[#AEC0A6] leading-relaxed">
                New CRI circular for Maha season is available for Kurunegala district.
              </p>

              <Link
                to="/app/notifications"
                className="mt-3 flex w-full items-center justify-center rounded-full bg-[#C9F169] py-2 px-3 text-xs font-semibold text-[#123524] transition-all hover:bg-[#d8fa7e] active:scale-98"
              >
                View advisory
              </Link>
            </div>
          ) : (
            <div className="flex justify-center pb-2 shrink-0">
              <Link
                to="/app/notifications"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123524] text-[#C9F169] shadow-xs text-base"
                title="Season advisory"
              >
                🌱
              </Link>
            </div>
          )
        )}

        {/* Bottom User Bar */}
        <div className="border-t border-[#E6EADF] p-2.5 shrink-0">
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className={`flex w-full items-center gap-2.5 rounded-2xl p-1.5 transition-colors hover:bg-[#F1F5EA] ${
                sidebarWide ? 'justify-between' : 'justify-center'
              }`}
              aria-expanded={profileOpen}
              aria-label="Account menu"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDF3E0] text-xs font-bold text-[#123524]">
                  {initials}
                </div>
                {sidebarWide && (
                  <div className="min-w-0 text-left">
                    <div className="truncate text-xs font-semibold text-[#10241A]">
                      {displayName}
                    </div>
                    <div className="text-[10px] text-[#5C6B60]">Pro plan</div>
                  </div>
                )}
              </div>
              {sidebarWide && (
                <MoreHorizontal className="h-4 w-4 shrink-0 text-[#5C6B60]" />
              )}
            </button>

            {/* Profile popup dropdown menu */}
            <div
              className={`absolute bottom-full left-0 z-50 mb-2 w-60 rounded-2xl border border-[#E6EADF] bg-white p-2 shadow-xl transition-all duration-200 ${
                profileOpen
                  ? 'pointer-events-auto scale-100 opacity-100'
                  : 'pointer-events-none scale-95 opacity-0'
              }`}
            >
              <div className="border-b border-[#E6EADF] p-3">
                <div className="truncate text-xs font-bold text-[#10241A]">{user?.name}</div>
                <div className="truncate text-[11px] text-[#5C6B60]">@{user?.username} · {user?.role}</div>
                {user?.email && <div className="truncate text-[10px] text-[#5C6B60] mt-0.5">{user.email}</div>}
              </div>
              <div className="p-1 space-y-0.5">
                <Link
                  to="/app/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[#10241A] hover:bg-[#F1F5EA]"
                >
                  <User className="h-3.5 w-3.5 text-[#5C6B60]" />
                  View profile
                </Link>
                <Link
                  to="/app/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[#10241A] hover:bg-[#F1F5EA]"
                >
                  <Settings className="h-3.5 w-3.5 text-[#5C6B60]" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-600" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
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
          <div className="flex h-16 items-center justify-between border-b border-[#E6EADF] px-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123524] text-lg shadow-xs">
                🌴
              </div>
              <span className="font-['Bricolage_Grotesque',Inter,sans-serif] font-bold text-sm tracking-wider text-[#10241A]">
                COCO CARE
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[#5C6B60] hover:bg-[#F1F5EA]"
              aria-label="Close navigation"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            <span className="block px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#5C6B60]">
              MENU
            </span>
            {menuNav.map((item) => {
              const active = isNavActive(location.pathname, item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex min-h-11 items-center gap-3 rounded-full px-4 py-2.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#123524] text-white shadow-xs font-semibold'
                      : 'text-[#5C6B60] hover:bg-[#F1F5EA] hover:text-[#10241A]'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{item.name}</span>
                </Link>
              )
            })}

            <span className="block px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#5C6B60]">
              TOOLS
            </span>
            {toolsNav.map((item) => {
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex min-h-11 items-center gap-3 rounded-full px-4 py-2.5 text-xs font-medium text-[#5C6B60] hover:bg-[#F1F5EA] hover:text-[#10241A]"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-[#E6EADF] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </aside>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className={`
            flex h-14 shrink-0 items-center justify-between gap-3 px-3 sm:h-16 sm:px-4 lg:px-6
            transition-[background-color,border-color,box-shadow] duration-200 z-10
            ${
              isScrolled
                ? 'bg-white/95 backdrop-blur-md border-b border-[#E6EADF] shadow-xs'
                : 'bg-[#F6F7F2] border-b border-transparent'
            }
          `}
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[#5C6B60] hover:bg-[#F1F5EA] hover:text-[#10241A] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* In topbar: quick brand on mobile */}
            <div className="flex items-center gap-2">
              <span className="font-['Bricolage_Grotesque',Inter,sans-serif] font-bold text-sm text-[#10241A] lg:hidden">
                COCO CARE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Notification bell icon button placed before the profile icon */}
            <Link
              to="/app/notifications"
              className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E6EADF] text-[#5C6B60] hover:border-[#123524] hover:text-[#10241A] transition-colors ${
                isScrolled ? 'bg-[#F6F7F2] hover:bg-white' : 'bg-white hover:bg-[#F1F5EA]'
              }`}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex min-w-[17px] h-[17px] items-center justify-center rounded-full bg-[#E5484D] px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadAlertsCount}
                </span>
              )}
            </Link>

            {/* Topbar quick profile chip */}
            <Link
              to="/app/profile"
              className={`flex min-h-9 items-center gap-2 rounded-full border border-[#E6EADF] py-1 px-3 text-xs font-medium text-[#10241A] hover:border-[#123524] transition-colors ${
                isScrolled ? 'bg-[#F6F7F2] hover:bg-white' : 'bg-white hover:bg-[#F1F5EA]'
              }`}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#123524] text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        <main
          ref={mainRef}
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
          className="relative flex-1 overflow-y-auto overflow-x-hidden p-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-4 lg:p-6 lg:pb-6"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E6EADF] bg-white/95 backdrop-blur-md lg:hidden"
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
                  active ? 'text-[#123524] font-semibold' : 'text-[#5C6B60] hover:text-[#10241A]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    active ? 'bg-[#EDF3E0] text-[#123524]' : ''
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

      {/* Compact FAB — hide on chat and when already on diagnosis hub */}
      {!location.pathname.startsWith('/app/chatbot') &&
      location.pathname !== '/app/disease-detection' &&
      !location.pathname.startsWith('/app/disease-detection/') ? (
        <Link
          to="/app/disease-detection"
          className="fixed z-30 flex items-center gap-2 rounded-full bg-[#123524] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#0C281B] hover:shadow-xl bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 px-3.5 py-3.5 sm:bottom-6 sm:right-6 sm:px-5 sm:py-4 lg:bottom-6"
          aria-label="Coco Disease Diagnosis"
        >
          <Microscope className="h-5 w-5 sm:h-6 sm:w-6 text-[#C9F169]" />
          <span className="hidden pr-1 text-sm font-medium sm:inline">Coco Disease Diagnosis</span>
        </Link>
      ) : null}
    </div>
  )
}
