import { AlertTriangle, CheckCircle, Bell, X, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reportsApi, diseaseMapApi, notificationsApi } from '@/api/services'

interface NotificationItem {
  id: string
  type: 'alert' | 'success' | 'info'
  title: string
  message: string
  time: string
  read: boolean
  source: 'broadcast' | 'disease' | 'report'
}

export function Notifications() {
  const queryClient = useQueryClient()
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('all')

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', 'my'],
    queryFn: reportsApi.my,
  })

  const { data: diseaseAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['disease-map', 'alerts'],
    queryFn: diseaseMapApi.alerts,
  })

  const { data: broadcasts = [], isLoading: broadcastsLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: notificationsApi.list,
  })

  const markBroadcastReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] }),
  })

  const markDiseaseAlertReadMutation = useMutation({
    mutationFn: diseaseMapApi.markAlertRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['disease-map', 'alerts'] }),
  })

  const notifications = useMemo(() => {
    const items: NotificationItem[] = []

    broadcasts.forEach((b) => {
      items.push({
        id: b.id,
        type: 'alert',
        title: b.title,
        message: b.message,
        time: new Date(b.createdAt).toLocaleString(),
        read: b.read,
        source: 'broadcast',
      })
    })

    diseaseAlerts.forEach((a) => {
      const isSuspected = a.alertType === 'ai_suspected'
      items.push({
        id: a.id,
        type: isSuspected ? 'info' : 'alert',
        title: isSuspected
          ? `AI-suspected nearby ${a.diseaseType}`
          : `Verified nearby ${a.diseaseType}`,
        message: a.message,
        time: new Date(a.createdAt).toLocaleString(),
        read: a.read,
        source: 'disease',
      })
    })

    reports.forEach((r) => {
      items.push({
        id: `report-${r.id}`,
        type: r.status === 'verified' ? 'success' : r.status === 'pending' ? 'info' : 'alert',
        title: r.status === 'pending' ? 'Diagnosis Pending Review' : `Report ${r.status}`,
        message: `${r.finalResult ?? r.imageResult ?? 'Disease scan'} — ${Math.round(r.confidence * 100)}% confidence.`,
        time: new Date(r.createdAt).toLocaleDateString(),
        read: r.status !== 'pending',
        source: 'report',
      })
    })

    return items
  }, [reports, diseaseAlerts, broadcasts])

  const visible = notifications
    .filter((n) => !deletedIds.has(n.id))
    .filter((n) => {
      if (filter === 'unread') return !n.read
      if (filter === 'read') return n.read
      return true
    })

  const unreadCount = notifications.filter(
    (n) => !n.read && !deletedIds.has(n.id),
  ).length
  const isLoading = reportsLoading || alertsLoading || broadcastsLoading

  const markAsRead = (item: NotificationItem) => {
    if (item.source === 'broadcast') {
      markBroadcastReadMutation.mutate(item.id)
    } else if (item.source === 'disease') {
      markDiseaseAlertReadMutation.mutate(item.id)
    }
  }

  const deleteNotification = (id: string) => setDeletedIds((prev) => new Set(prev).add(id))
  const markAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markAsRead(n)
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="mb-1 text-2xl text-[#1a2e1a] sm:mb-2 sm:text-3xl">Notifications</h1>
          <p className="text-sm text-[#6b7c6b] sm:text-base">
            Admin broadcasts, nearby outbreak alerts, and your report updates.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="min-h-10 shrink-0 self-start text-sm text-[#2d5f2e] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`min-h-10 shrink-0 rounded-lg px-4 py-2 text-sm capitalize ${
              filter === f
                ? 'bg-[#2d5f2e] text-white'
                : 'border border-gray-200 bg-white text-gray-700'
            }`}
          >
            {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#2d5f2e]" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-green-100 bg-white p-8 text-center text-gray-500 sm:p-12">
          No notifications to show.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={() => markAsRead(notification)}
              onDelete={() => deleteNotification(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationCard({
  notification,
  onRead,
  onDelete,
}: {
  notification: NotificationItem
  onRead: () => void
  onDelete: () => void
}) {
  const icons = {
    alert: <AlertTriangle className="h-5 w-5 text-red-600" />,
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    info: <Bell className="h-5 w-5 text-blue-600" />,
  }

  const canMarkRead = notification.source === 'broadcast' || notification.source === 'disease'

  return (
    <div
      className={`flex gap-3 rounded-xl border bg-white p-3 sm:gap-4 sm:p-4 ${
        notification.read ? 'border-gray-100 opacity-75' : 'border-green-200'
      }`}
    >
      <div className="mt-0.5 shrink-0">{icons[notification.type]}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900 sm:text-base">{notification.title}</h3>
          <button
            onClick={onDelete}
            className="flex min-h-9 min-w-9 shrink-0 items-center justify-center text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{notification.message}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-gray-400">{notification.time}</span>
          {!notification.read && canMarkRead ? (
            <button onClick={onRead} className="text-xs text-[#2d5f2e] hover:underline">
              Mark as read
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
