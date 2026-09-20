import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { notificationsApi, officerConsultationsApi, reportsApi } from '@/api/services'
import {
  DesktopHeader,
  MobileHeader,
  MobileNotificationsSheet,
} from '@/app/components/layout'
import { OfficerSidebar } from '@/app/components/officer/OfficerSidebar'
import { OfficerMobileNav } from '@/app/components/officer/OfficerMobileNav'
import { OfficerMobileProfileSheet } from '@/app/components/officer/OfficerMobileProfileSheet'

export function OfficerLayout() {
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileProfileSheetOpen, setMobileProfileSheetOpen] = useState(false)
  const [mobileNotificationsSheetOpen, setMobileNotificationsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const assignedRegion = user?.assignedRegion?.trim()

  const { data: inbox } = useQuery({
    queryKey: ['notifications', 'inbox'],
    queryFn: notificationsApi.list,
    refetchInterval: 20_000,
  })
  const notifications = inbox?.items ?? []
  const unreadCount = inbox?.unreadCount ?? 0

  const { data: pendingReports = [] } = useQuery({
    queryKey: ['officer', 'pending-reports'],
    queryFn: reportsApi.pending,
    enabled: Boolean(assignedRegion),
    refetchInterval: 30_000,
  })

  const { data: threads = [] } = useQuery({
    queryKey: ['officer', 'consultations'],
    queryFn: officerConsultationsApi.list,
    enabled: Boolean(assignedRegion),
    refetchInterval: 20_000,
  })

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const dismissMutation = useMutation({
    mutationFn: notificationsApi.dismiss,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const initials = (user?.name ?? 'O')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const displayName = user?.name
    ? `${user.name.split(' ')[0]} ${user.name.split(' ')[1]?.[0] ? `${user.name.split(' ')[1][0]}.` : ''}`
    : 'Officer'

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
    setProfileOpen(false)
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
      setIsScrolled(false)
    }
  }, [location.pathname])

  const needsReplyCount = threads.filter((item) => item.inbox === 'needs_reply').length
  const fullBleed = location.pathname.startsWith('/officer/consultations')

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#F6F7F2]">
      <OfficerSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        profileRef={profileRef}
        user={user}
        displayName={displayName}
        initials={initials}
        unreadCount={unreadCount}
        pendingCount={pendingReports.length}
        needsReplyCount={needsReplyCount}
        handleLogout={handleLogout}
        locationPath={location.pathname}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader
          locationPath={location.pathname}
          homeHref="/officer"
          farmName={user?.assignedRegion?.trim() || 'Officer desk'}
          unreadAlertsCount={unreadCount}
          initials={initials}
          onOpenProfile={() => setMobileProfileSheetOpen(true)}
          onOpenNotifications={() => setMobileNotificationsSheetOpen(true)}
        />

        <DesktopHeader
          isScrolled={isScrolled}
          unreadAlertsCount={unreadCount}
          initials={initials}
          userName={user?.name}
          notifications={notifications}
          notificationsHref="/officer/notifications"
          profileHref="/officer/settings"
          onMarkRead={(item) => {
            if (!item.read) markReadMutation.mutate(item.id)
          }}
          onMarkAllRead={() => markAllMutation.mutateAsync()}
        />

        <main
          ref={mainRef}
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
          className={`relative flex-1 ${
            fullBleed
              ? 'p-0 pb-[74px] overflow-hidden flex flex-col lg:p-6 lg:pb-6 lg:block'
              : 'overflow-y-auto overflow-x-hidden p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-4 lg:p-6 lg:pb-6'
          }`}
        >
          <Outlet />
        </main>
      </div>

      <OfficerMobileNav locationPath={location.pathname} />

      <OfficerMobileProfileSheet
        isOpen={mobileProfileSheetOpen}
        onClose={() => setMobileProfileSheetOpen(false)}
        userName={user?.name}
        region={user?.assignedRegion?.trim() || 'No region assigned'}
        pendingCount={pendingReports.length}
        needsReplyCount={needsReplyCount}
        unreadCount={unreadCount}
        initials={initials}
        handleLogout={handleLogout}
      />

      <MobileNotificationsSheet
        isOpen={mobileNotificationsSheetOpen}
        onClose={() => setMobileNotificationsSheetOpen(false)}
        notifications={notifications}
        unreadAlertsCount={unreadCount}
        inboxHref="/officer/notifications"
        onMarkRead={(item) => {
          if (!item.read) markReadMutation.mutate(item.id)
        }}
        onMarkAllRead={() => markAllMutation.mutateAsync()}
        onDismiss={(item) => dismissMutation.mutate(item.id)}
      />
    </div>
  )
}
