import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { farmApi, reportsApi, notificationsApi } from '@/api/services'
import {
  DesktopSidebar,
  DesktopHeader,
  MobileHeader,
  MobileBottomNav,
  MobileProfileSheet,
  MobileNotificationsSheet,
} from './layout'

export function DashboardLayout() {
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

  const { data: inbox } = useQuery({
    queryKey: ['notifications', 'inbox'],
    queryFn: notificationsApi.list,
    refetchInterval: 20_000,
  })
  const notifications = inbox?.items ?? []
  const unreadAlertsCount = inbox?.unreadCount ?? 0

  const { data: farmerReports = [] } = useQuery({
    queryKey: ['reports', 'my'],
    queryFn: reportsApi.my,
  })

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['disease-map', 'alerts'] })
    },
  })
  const dismissMutation = useMutation({
    mutationFn: notificationsApi.dismiss,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['disease-map', 'alerts'] })
    },
  })

  const handleMarkAllNotificationsRead = async () => {
    await markAllMutation.mutateAsync()
  }

  const { data: farmerProfile } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })
  const primaryFarm =
    farmerProfile?.farms?.find((farm) => farm.isPrimary) ?? farmerProfile?.farms?.[0]
  const farmName = primaryFarm?.name ?? 'Your farm'
  const farmLocation = primaryFarm?.location ?? 'Sri Lanka'
  const treeCount = primaryFarm?.treeCount ?? 0
  const landArea = primaryFarm ? `${primaryFarm.acreage} ac` : '—'
  const aiScansCount = farmerReports.length || 0

  const initials = (user?.name ?? 'Sunil Perera')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const displayName = user?.name
    ? `${user.name.split(' ')[0]} ${user.name.split(' ')[1]?.[0] ? `${user.name.split(' ')[1][0]}.` : ''}`
    : 'Sunil P.'

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

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#F6F7F2]">
      {/* Desktop sidebar */}
      <DesktopSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        profileRef={profileRef}
        user={user}
        farmName={farmName}
        farmLocation={farmLocation}
        treeCount={treeCount}
        landArea={landArea}
        aiScansCount={aiScansCount}
        displayName={displayName}
        initials={initials}
        handleLogout={handleLogout}
        locationPath={location.pathname}
      />

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top app bar */}
        <MobileHeader
          locationPath={location.pathname}
          farmName={farmName}
          unreadAlertsCount={unreadAlertsCount}
          initials={initials}
          onOpenProfile={() => setMobileProfileSheetOpen(true)}
          onOpenNotifications={() => setMobileNotificationsSheetOpen(true)}
        />

        {/* Desktop top header */}
        <DesktopHeader
          isScrolled={isScrolled}
          unreadAlertsCount={unreadAlertsCount}
          initials={initials}
          userName={user?.name}
          notifications={notifications}
          onMarkRead={(item) => {
            if (!item.read) markReadMutation.mutate(item.id)
          }}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />

        {/* Main content area */}
        <main
          ref={mainRef}
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
          className={`relative flex-1 ${
            location.pathname.startsWith('/app/chatbot') ||
            location.pathname.startsWith('/app/consultations')
              ? 'p-0 pb-[calc(6.5rem+env(safe-area-inset-bottom))] overflow-hidden flex flex-col lg:p-6 lg:pb-6 lg:block'
              : 'overflow-y-auto overflow-x-hidden p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-4 lg:p-6 lg:pb-6'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Floating Nav */}
      <MobileBottomNav locationPath={location.pathname} />

      {/* Mobile Profile Bottom Sheet */}
      <MobileProfileSheet
        isOpen={mobileProfileSheetOpen}
        onClose={() => setMobileProfileSheetOpen(false)}
        userName={user?.name}
        farmName={farmName}
        farmLocation={farmLocation}
        treeCount={treeCount}
        landArea={landArea}
        aiScansCount={aiScansCount}
        initials={initials}
        handleLogout={handleLogout}
      />

      {/* Mobile Notifications Bottom Sheet */}
      <MobileNotificationsSheet
        isOpen={mobileNotificationsSheetOpen}
        onClose={() => setMobileNotificationsSheetOpen(false)}
        notifications={notifications}
        unreadAlertsCount={unreadAlertsCount}
        onMarkRead={(item) => {
          if (!item.read) markReadMutation.mutate(item.id)
        }}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDismiss={(item) => dismissMutation.mutate(item.id)}
      />
    </div>
  )
}
