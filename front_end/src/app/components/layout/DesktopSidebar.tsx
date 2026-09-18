import { Link } from 'react-router'
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  Map,
  Settings,
  HelpCircle,
  Search,
  PanelLeftClose,
  MoreHorizontal,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react'
import type { User as AuthUser } from '@/types'

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

interface DesktopSidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  profileOpen: boolean
  setProfileOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  profileRef: React.RefObject<HTMLDivElement | null>
  user: AuthUser | null
  farmName: string
  farmLocation: string
  treeCount: number
  landArea: string
  aiScansCount: number
  displayName: string
  initials: string
  handleLogout: () => void
  locationPath: string
}

export function DesktopSidebar({
  collapsed,
  setCollapsed,
  searchQuery,
  setSearchQuery,
  profileOpen,
  setProfileOpen,
  profileRef,
  user,
  farmName,
  farmLocation,
  treeCount,
  landArea,
  aiScansCount,
  displayName,
  initials,
  handleLogout,
  locationPath,
}: DesktopSidebarProps) {
  const sidebarWide = !collapsed

  return (
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
              Menu
            </span>
          )}
          <nav className="space-y-0.5" aria-label="Main menu">
            {menuNav.map((item) => {
              const active = isNavActive(locationPath, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 rounded-full text-xs font-medium transition-colors
                    ${sidebarWide ? 'px-3.5 py-2.5' : 'justify-center p-2.5'}
                    ${
                      active
                        ? 'bg-[#123524] text-white shadow-xs'
                        : 'text-[#10241A] hover:bg-[#F1F5EA]'
                    }
                  `}
                  title={!sidebarWide ? item.name : undefined}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${active ? 'text-[#C9F169]' : 'text-[#5C6B60]'}`}
                  />
                  {sidebarWide && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* COMMUNITY & EXPERTS Section */}
        <div>
          {sidebarWide && (
            <span className="block px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5C6B60]">
              Community & Experts
            </span>
          )}
          <div className="space-y-0.5">
            <Link
              to="/app/chatbot"
              className={`
                flex items-center gap-3 rounded-full text-xs font-medium text-[#10241A] hover:bg-[#F1F5EA] transition-colors
                ${sidebarWide ? 'px-3.5 py-2.5' : 'justify-center p-2.5'}
              `}
              title={!sidebarWide ? 'Officer consultations' : undefined}
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EDF3E0] text-[10px] font-bold text-[#123524] shrink-0">
                💬
              </div>
              {sidebarWide && <span className="truncate">Officer consultations</span>}
            </Link>
          </div>
        </div>

        {/* TOOLS Section */}
        <div>
          {sidebarWide && (
            <span className="block px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5C6B60]">
              Tools
            </span>
          )}
          <nav className="space-y-0.5" aria-label="Tools menu">
            {toolsNav.map((item) => {
              const active = !item.isAction && isNavActive(locationPath, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 rounded-full text-xs font-medium transition-colors
                    ${sidebarWide ? 'px-3.5 py-2.5' : 'justify-center p-2.5'}
                    ${
                      active
                        ? 'bg-[#123524] text-white shadow-xs'
                        : 'text-[#10241A] hover:bg-[#F1F5EA]'
                    }
                  `}
                  title={!sidebarWide ? item.name : undefined}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${active ? 'text-[#C9F169]' : 'text-[#5C6B60]'}`}
                  />
                  {sidebarWide && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Primary Farm Card */}
        {sidebarWide && (
          <div className="rounded-2xl border border-[#E6EADF] bg-[#F6F7F2] p-3 text-xs">
            <div className="flex items-center justify-between text-[#5C6B60]">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#10241A]">
                Primary Farm
              </span>
              <Link to="/app/profile" className="text-[10px] font-semibold text-[#123524] hover:underline">
                Manage
              </Link>
            </div>
            <div className="mt-1.5 font-bold text-[#10241A] truncate">{farmName}</div>
            <div className="text-[11px] text-[#5C6B60] mt-0.5">{farmLocation}</div>
            <div className="mt-2.5 grid grid-cols-3 gap-1 pt-2 border-t border-[#E6EADF] text-center text-[10px]">
              <div>
                <b className="block text-[#10241A] font-bold">{treeCount}</b>
                <span className="text-[#5C6B60]">Trees</span>
              </div>
              <div>
                <b className="block text-[#10241A] font-bold">{landArea}</b>
                <span className="text-[#5C6B60]">Land</span>
              </div>
              <div>
                <b className="block text-[#10241A] font-bold">{aiScansCount}</b>
                <span className="text-[#5C6B60]">Scans</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Bar & Popover Menu */}
      <div className="relative border-t border-[#E6EADF] p-3 shrink-0" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          className={`
            flex w-full items-center gap-2.5 rounded-2xl text-left transition-colors
            ${sidebarWide ? 'p-2 hover:bg-[#F1F5EA]' : 'justify-center p-2 hover:bg-[#F1F5EA]'}
          `}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#123524] text-xs font-bold text-white shadow-xs">
            {initials}
          </div>
          {sidebarWide && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-[#10241A]">{displayName}</div>
                <div className="truncate text-[10px] text-[#5C6B60]">@{user?.username ?? 'grower'}</div>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#5C6B60] transition-transform ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </>
          )}
        </button>

        {/* Profile Popover Menu */}
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
    </aside>
  )
}
