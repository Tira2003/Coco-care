import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Send } from 'lucide-react'
import { adminApi } from '@/api/services'
import type { NotificationAudience } from '@/types'

export function AdminNotificationsPage() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState<NotificationAudience>('all')
  const [error, setError] = useState('')

  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: adminApi.listBroadcasts,
  })

  const createMutation = useMutation({
    mutationFn: adminApi.createBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
      setTitle('')
      setMessage('')
      setAudience('all')
      setError('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to send broadcast')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Broadcast Notifications</h1>
        <p className="text-[#6b7c6b]">Send alerts to farmers, officers, or everyone.</p>
      </div>

      <div className="bg-white rounded-2xl border border-green-100 p-6 space-y-4 max-w-2xl">
        <label className="block text-sm">
          <span className="text-gray-600">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg"
            placeholder="Outbreak advisory"
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg"
            placeholder="Write the alert farmers or officers should see…"
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Audience</span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as NotificationAudience)}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="all">Everyone</option>
            <option value="farmers">Farmers only</option>
            <option value="officers">Officers only</option>
          </select>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          disabled={createMutation.isPending || !title.trim() || !message.trim()}
          onClick={() => createMutation.mutate({ title, message, audience })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d5f2e] text-white text-sm disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {createMutation.isPending ? 'Sending…' : 'Send broadcast'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-green-100 bg-green-50/60">
          <h2 className="text-sm font-semibold text-[#1a2e1a]">Recent broadcasts</h2>
        </div>
        {isLoading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#2d5f2e]" />
          </div>
        ) : broadcasts.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No broadcasts yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {broadcasts.map((n) => (
              <li key={n.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{n.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 capitalize">
                    {n.audience}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
