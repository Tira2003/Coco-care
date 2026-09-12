import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import {
  LogOut,
  Phone,
  Mail,
  MapPin,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CocoCareLogo } from '@/app/components/CocoCareLogo'

export function OfficerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const initials = (user?.name ?? 'O')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    setProfileOpen(false)
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
    setProfileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/80 via-gray-50 to-gray-100">
      <header className="sticky top-0 z-30 border-b border-green-100/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link to="/officer/reports" className="flex shrink-0 items-center gap-2 hover:opacity-90 transition-opacity">
              <CocoCareLogo iconClassName="h-8 w-auto max-w-[120px] object-contain" />
              <span className="hidden text-lg font-semibold text-[#2d5f2e] sm:inline">Officer</span>
            </Link>
            {user?.assignedRegion ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-[#2d5f2e]">
                <MapPin className="h-3 w-3" />
                {user.assignedRegion}
              </span>
            ) : null}
          </div>

          <div className="relative shrink-0" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-transparent p-1.5 pr-3 transition-all hover:border-green-100 hover:bg-green-50"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] text-sm font-medium text-white">
                {initials}
              </div>
              <span className="hidden max-w-[8rem] truncate text-sm font-medium text-gray-800 sm:block">
                {user?.name}
              </span>
            </button>

            <div
              className={`absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-2xl border border-green-100 bg-white shadow-xl transition-all duration-200 ${
                profileOpen
                  ? 'pointer-events-auto scale-100 opacity-100'
                  : 'pointer-events-none scale-95 opacity-0'
              }`}
            >
              <div className="border-b border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-gray-900">{user?.name}</div>
                    <div className="text-xs capitalize text-gray-500">
                      @{user?.username} · {user?.role}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="h-4 w-4 shrink-0 text-[#2d5f2e]" />
                  <span className="capitalize">{user?.role} account</span>
                </div>
                {user?.assignedRegion ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0 text-[#2d5f2e]" />
                    Assigned region: {user.assignedRegion}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
                    No region assigned — contact admin to review reports.
                  </p>
                )}
                {user?.phone ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 shrink-0 text-[#2d5f2e]" />
                    {user.phone}
                  </div>
                ) : null}
                {user?.email ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 shrink-0 text-[#2d5f2e]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-gray-100 p-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
