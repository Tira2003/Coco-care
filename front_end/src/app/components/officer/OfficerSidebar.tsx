import { Link, useNavigate } from 'react-router'
import {
  LayoutGrid,
  ClipboardList,
  MessageSquare,
  Map,
  Bell,
  HelpCircle,
  Search,
  PanelLeftClose,
  LogOut,
  ChevronDown,
  Shield,
} from 'lucide-react'
import type { User as AuthUser } from '@/types'

const menuNav = [
  { name: 'Dashboard', href: '/officer', icon: LayoutGrid },
  { name: 'Report review', href: '/officer/reports', icon: ClipboardList },
  { name: 'Consultations', href: '/officer/consultations', icon: MessageSquare },
  { name: 'Disease heatmap', href: '/officer/heatmap', icon: Map },
  { name: 'Inbox', href: '/officer/notifications', icon: Bell },
]

const toolsNav = [{ name: 'Help Center', href: '/officer/help', icon: HelpCircle }]

function isNavActive(pathname: string, href: string) {
  if (href === '/officer') return pathname === '/officer'
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface OfficerSidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  profileOpen: boolean
  setProfileOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  profileRef: React.RefObject<HTMLDivElement | null>
  user: AuthUser | null
  displayName: string
  initials: string
  unreadCount: number
  pendingCount: number
  needsReplyCount: number
  handleLogout: () => void
  locationPath: string
}

export function OfficerSidebar({
  collapsed,
  setCollapsed,
  searchQuery,
  setSearchQuery,
  profileOpen,
  setProfileOpen,
  profileRef,
  user,
  displayName,
  initials,
  unreadCount,
  pendingCount,
  needsReplyCount,
  handleLogout,
  locationPath,
}: OfficerSidebarProps) {
  const navigate = useNavigate()
  const sidebarWide = !collapsed
  const region = user?.assignedRegion?.trim() || 'No region assigned'

  return (
    <aside
      className={`
        hidden lg:flex flex-col shrink-0 bg-white border-r border-[#E6EADF]
        transition-[width] duration-300 ease-in-out overflow-hidden select-none
        ${collapsed ? 'w-[4.75rem]' : 'w-64'}
      `}
    >
      <div
        className={`flex items-center p-3 shrink-0 min-h-[4rem] border-b border-[#E6EADF] ${
          sidebarWide ? 'justify-between px-4' : 'justify-center'
        }`}
      >
        {sidebarWide ? (
          <>
            <Link to="/officer" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123524] text-lg shadow-xs shrink-0">
                <img src="/new logo.svg" alt="Coco Care logo" className="h-5 w-5 object-contain" />
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
            <img src="/new logo.svg" alt="Coco Care logo" className="h-5 w-5 object-contain" />
          </button>
        )}
      </div>

      {sidebarWide ? (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 rounded-full border border-[#E6EADF] bg-[#F6F7F2] px-3.5 py-2 text-xs text-[#5C6B60] transition-colors focus-within:border-[#123524] focus-within:bg-white">
            <Search className="h-3.5 w-3.5 shrink-0 text-[#5C6B60]" />
            <input
              type="text"
              placeholder="Search help"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                const q = searchQuery.trim()
                navigate(q ? `/officer/help?q=${encodeURIComponent(q)}` : '/officer/help')
              }}
              className="w-full bg-transparent text-xs text-[#10241A] placeholder-[#5C6B60] outline-none"
            />
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4 scrollbar-thin">
        <div>
          {sidebarWide && (
            <span className="block px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5C6B60]">
              Menu
            </span>
          )}
          <nav className="space-y-0.5" aria-label="Officer menu">
            {menuNav.map((item) => {
              const active = isNavActive(locationPath, item.href)
              const Icon = item.icon
              const badge =
                item.href === '/officer/reports'
                  ? pendingCount
                  : item.href === '/officer/consultations'
                    ? needsReplyCount
                    : item.href === '/officer/notifications'
                      ? unreadCount
                      : 0
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
                  {sidebarWide && <span className="min-w-0 flex-1 truncate">{item.name}</span>}
                  {sidebarWide && badge > 0 ? (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-[#EDF3E0] text-[#123524]'
                      }`}
                    >
                      {badge > 99 ? '99+' : badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          {sidebarWide && (
            <span className="block px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5C6B60]">
              Tools
            </span>
          )}
          <nav className="space-y-0.5" aria-label="Tools menu">
            {toolsNav.map((item) => {
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

        {sidebarWide && (
          <div className="rounded-2xl border border-[#E6EADF] bg-[#F6F7F2] p-3 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#10241A]">
              <Shield className="h-3.5 w-3.5 text-[#123524]" />
              Assigned region
            </div>
            <div className="mt-1.5 font-bold text-[#10241A] truncate">{region}</div>
            <div className="mt-2.5 grid grid-cols-2 gap-1 pt-2 border-t border-[#E6EADF] text-center text-[10px]">
              <div>
                <b className="block text-[#10241A] font-bold">{pendingCount}</b>
                <span className="text-[#5C6B60]">Pending</span>
              </div>
              <div>
                <b className="block text-[#10241A] font-bold">{needsReplyCount}</b>
                <span className="text-[#5C6B60]">Replies</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
                <div className="truncate text-[10px] text-[#5C6B60]">@{user?.username ?? 'officer'}</div>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#5C6B60] transition-transform ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </>
          )}
        </button>

        <div
          className={`absolute bottom-full left-0 z-50 mb-2 w-60 rounded-2xl border border-[#E6EADF] bg-white p-2 shadow-xl transition-all duration-200 ${
            profileOpen
              ? 'pointer-events-auto scale-100 opacity-100'
              : 'pointer-events-none scale-95 opacity-0'
          }`}
        >
          <div className="border-b border-[#E6EADF] p-3">
            <div className="truncate text-xs font-bold text-[#10241A]">{user?.name}</div>
            <div className="truncate text-[11px] text-[#5C6B60]">
              @{user?.username} · officer
            </div>
            {user?.assignedRegion ? (
              <div className="truncate text-[10px] text-[#5C6B60] mt-0.5">{user.assignedRegion}</div>
            ) : null}
          </div>
          <div className="p-1 space-y-0.5">
            <Link
              to="/officer/settings"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[#10241A] hover:bg-[#F1F5EA]"
            >
              <Shield className="h-3.5 w-3.5 text-[#5C6B60]" />
              Account settings
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
