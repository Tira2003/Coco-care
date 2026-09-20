import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import type { InboxCategory, InboxNotification } from '@/types'
import { NotificationCard } from '@/app/notifications/NotificationCard'

type Filter = 'all' | 'unread' | InboxCategory

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'outbreak', label: 'Outbreaks' },
  { id: 'report', label: 'Reports' },
  { id: 'consultation', label: 'Messages' },
  { id: 'announcement', label: 'Announcements' },
]

export function Notifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<Filter>('all')
  const isOfficer = user?.role === 'officer'

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'inbox'],
    queryFn: notificationsApi.list,
    refetchInterval: 20_000,
  })

  const items = data?.items ?? []
  const unreadCount = data?.unreadCount ?? items.filter((item) => !item.read).length

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

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (filter === 'unread') return !item.read
      if (filter === 'all') return true
      return item.category === filter
    })
  }, [items, filter])

  const openItem = (item: InboxNotification) => {
    if (!item.read) markReadMutation.mutate(item.id)
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold text-[#10241A] sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[#5C6B60]">
            {isOfficer
              ? 'Farmer consultations, pending diagnoses in your district, and CRI announcements.'
              : 'Outbreaks near your farm, diagnosis updates, officer replies, and CRI announcements.'}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-full bg-[#123524] px-4 text-sm font-semibold text-white hover:bg-[#0C281B] disabled:opacity-60"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        ) : null}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => {
          const count =
            f.id === 'unread'
              ? unreadCount
              : f.id === 'all'
                ? items.length
                : items.filter((item) => item.category === f.id).length
          if (f.id !== 'all' && f.id !== 'unread' && count === 0) return null
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium capitalize ${
                filter === f.id
                  ? 'bg-[#123524] text-white'
                  : 'border border-[#E6EADF] bg-white text-[#10241A] hover:bg-[#F1F5EA]'
              }`}
            >
              {f.label}
              {count > 0 ? ` (${count})` : ''}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-[#E6EADF] bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF3E0] text-[#123524]">
            <Bell className="h-6 w-6" />
          </div>
          <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
            {filter === 'unread' ? 'You are caught up' : 'No notifications yet'}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#5C6B60]">
            {filter === 'unread'
              ? 'New outbreak alerts, diagnosis results, and officer replies will show up here.'
              : 'When something needs your attention, it will land in this inbox.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              onOpen={openItem}
              onDismiss={(n) => dismissMutation.mutate(n.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
