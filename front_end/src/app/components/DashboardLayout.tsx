import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { diseaseMapApi, farmApi, reportsApi, notificationsApi } from '@/api/services'
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

  const { data: diseaseAlerts = [] } = useQuery({
    queryKey: ['disease-map', 'alerts'],
    queryFn: diseaseMapApi.alerts,
  })
  const { data: broadcasts = [] } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: notificationsApi.list,
  })
  const unreadAlertsCount =
    diseaseAlerts.filter((a) => !a.read).length + broadcasts.filter((b) => !b.read).length

  const { data: farmerReports = [] } = useQuery({
    queryKey: ['reports', 'my'],
    queryFn: reportsApi.my,
  })

  const markDiseaseAlertReadMutation = useMutation({
    mutationFn: diseaseMapApi.markAlertRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['disease-map', 'alerts'] }),
  })
  const markBroadcastReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] }),
  })

  const handleMarkAllNotificationsRead = async () => {
    const unreadAlerts = diseaseAlerts.filter((a) => !a.read)
    const unreadBroadcasts = broadcasts.filter((b) => !b.read)
    await Promise.all([
      ...unreadAlerts.map((a) => markDiseaseAlertReadMutation.mutateAsync(a.id)),
      ...unreadBroadcasts.map((b) => markBroadcastReadMutation.mutateAsync(b.id)),
    ])
  }

  const { data: farmerProfile } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })
  const primaryFarm = farmerProfile?.farms?.[0]
  const farmName = primaryFarm?.name ?? 'Green Valley Farm'
  const farmLocation = primaryFarm?.location ?? 'Kurunegala'
  const treeCount = primaryFarm?.treeCount ?? 320
  const landArea = primaryFarm?.landArea ? `${primaryFarm.landArea} ha` : '4.2 ha'
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
        />

        {/* Main content area */}
        <main
          ref={mainRef}
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
          className={`relative flex-1 ${
            location.pathname.startsWith('/app/chatbot')
              ? 'p-0 pb-[74px] overflow-hidden flex flex-col lg:p-6 lg:pb-6 lg:block'
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
        diseaseAlerts={diseaseAlerts}
        broadcasts={broadcasts}
        unreadAlertsCount={unreadAlertsCount}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />
    </div>
  )
}
