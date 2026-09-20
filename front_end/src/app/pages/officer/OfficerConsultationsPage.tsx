import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react'
import { officerConsultationsApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import type { ConsultationInbox, ConsultationThread } from '@/types'

type Tab = 'needs_reply' | 'waiting' | 'resolved' | 'all'

function formatTime(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function officerBadge(inbox: ConsultationInbox) {
  if (inbox === 'resolved') return { label: 'Resolved', className: 'bg-[#F6F7F2] text-[#5C6B60]' }
  if (inbox === 'waiting') return { label: 'Waiting on farmer', className: 'bg-[#DDF2EA] text-[#147A5C]' }
  return { label: 'Needs reply', className: 'bg-[#FCF0DA] text-[#8A5A00]' }
}

export function OfficerConsultationsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const assignedRegion = user?.assignedRegion?.trim()
  const [tab, setTab] = useState<Tab>('needs_reply')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['officer', 'consultations'],
    queryFn: officerConsultationsApi.list,
    enabled: Boolean(assignedRegion),
    refetchInterval: 10_000,
  })

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['officer', 'consultations', activeId],
    queryFn: () => officerConsultationsApi.get(activeId!),
    enabled: Boolean(assignedRegion && activeId),
    refetchInterval: activeId ? 8_000 : false,
  })

  const filtered = useMemo(() => {
    if (tab === 'all') return threads
    return threads.filter((item) => item.inbox === tab)
  }, [tab, threads])

  useEffect(() => {
    if (!activeId) return
    if (!filtered.some((item) => item.id === activeId)) {
      setActiveId(filtered[0]?.id ?? null)
    }
  }, [activeId, filtered])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages.length])

  const replyMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      officerConsultationsApi.reply(id, content),
    onSuccess: (updated) => {
      queryClient.setQueryData(['officer', 'consultations', updated.id], updated)
      queryClient.invalidateQueries({ queryKey: ['officer', 'consultations'] })
      setReply('')
    },
  })

  const resolveMutation = useMutation({
    mutationFn: officerConsultationsApi.resolve,
    onSuccess: (updated) => {
      queryClient.setQueryData(['officer', 'consultations', updated.id], updated)
      queryClient.invalidateQueries({ queryKey: ['officer', 'consultations'] })
    },
  })

  const counts = {
    needs_reply: threads.filter((item) => item.inbox === 'needs_reply').length,
    waiting: threads.filter((item) => item.inbox === 'waiting').length,
    resolved: threads.filter((item) => item.inbox === 'resolved').length,
    all: threads.length,
  }

  if (!assignedRegion) {
    return (
      <div className="rounded-2xl border border-[#F5A524]/40 bg-[#FCF0DA] px-5 py-8 text-sm text-[#8A5A00]">
        No region assigned. Ask an admin to set your district so farmer consultations can reach this inbox.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4 lg:h-auto">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#123524]">
          {assignedRegion} desk
        </p>
        <h1 className="mt-1 font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold text-[#10241A]">Farmer consultations</h1>
        <p className="mt-1 text-sm text-[#5C6B60]">
          Direct messages from farmers in your assigned district. Separate from Coco AI.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['needs_reply', 'Needs reply'],
            ['waiting', 'Waiting on farmer'],
            ['resolved', 'Resolved'],
            ['all', 'All'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              tab === id ? 'bg-[#123524] text-white' : 'bg-white text-[#10241A] ring-1 ring-[#E6EADF]'
            }`}
          >
            {label} {counts[id]}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#E6EADF] bg-white shadow-sm lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-[#E6EADF] lg:border-b-0 lg:border-r">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-[#5C6B60]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading inbox
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-[#5C6B60]">
              No consultations in this view.
            </p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto p-2 lg:max-h-[70vh]">
              {filtered.map((item) => {
                const badge = officerBadge(item.inbox)
                const active = item.id === activeId
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`mb-1 w-full rounded-xl px-3 py-3 text-left ${
                      active ? 'bg-[#EDF3E0] ring-1 ring-[#C9F169]' : 'hover:bg-[#F6F7F2]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#10241A]">{item.farmerName}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#5C6B60]">{item.topic}</p>
                    <p className="mt-1 truncate text-xs text-[#8A9A8E]">{item.lastMessage}</p>
                    <p className="mt-1 text-[11px] text-[#8A9A8E]">{formatTime(item.updatedAt)}</p>
                  </button>
                )
              })}
            </div>
          )}
        </aside>

        <section className="flex min-h-[420px] flex-col lg:min-h-[70vh]">
          {threadLoading && activeId ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[#5C6B60]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opening thread
            </div>
          ) : thread ? (
            <OfficerThread
              thread={thread}
              reply={reply}
              setReply={setReply}
              sending={replyMutation.isPending}
              resolving={resolveMutation.isPending}
              onReply={() => {
                if (!reply.trim() || replyMutation.isPending) return
                replyMutation.mutate({ id: thread.id, content: reply.trim() })
              }}
              onResolve={() => resolveMutation.mutate(thread.id)}
              bottomRef={bottomRef}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-sm text-[#5C6B60]">
              <MessageSquare className="mb-3 h-8 w-8 text-[#123524]" />
              Select a farmer thread to reply.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function OfficerThread({
  thread,
  reply,
  setReply,
  sending,
  resolving,
  onReply,
  onResolve,
  bottomRef,
}: {
  thread: ConsultationThread
  reply: string
  setReply: (value: string) => void
  sending: boolean
  resolving: boolean
  onReply: () => void
  onResolve: () => void
  bottomRef: React.RefObject<HTMLDivElement | null>
}) {
  const badge = officerBadge(thread.inbox)
  return (
    <>
      <header className="border-b border-[#E6EADF] px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-[#10241A]">{thread.farmerName}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-[#5C6B60]">
              <MapPin className="h-3.5 w-3.5" />
              {thread.farmName ?? 'Farm'} · {thread.district}
            </p>
            {thread.farmerPhone ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-[#5C6B60]">
                <Phone className="h-3.5 w-3.5" />
                {thread.farmerPhone}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-[#10241A]">{thread.topic}</p>
          </div>
          {thread.status === 'open' ? (
            <button
              type="button"
              onClick={onResolve}
              disabled={resolving}
              className="inline-flex items-center gap-1 rounded-full border border-[#E6EADF] px-3 py-1.5 text-xs font-semibold text-[#123524] hover:bg-[#F1F5EA] disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {resolving ? 'Closing...' : 'Mark resolved'}
            </button>
          ) : null}
        </div>
        {thread.reportLabel ? (
          <p className="mt-3 rounded-xl bg-[#EDF3E0] px-3 py-2 text-xs text-[#0C281B]">
            Attached diagnosis: {thread.reportLabel}
            {thread.reportStatus ? ` · ${thread.reportStatus}` : ''}
          </p>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F6F7F2] p-4">
        {thread.messages.map((message) => {
          const mine = message.senderRole === 'officer'
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  mine
                    ? 'rounded-br-md bg-[#123524] text-white'
                    : 'rounded-bl-md bg-white text-[#10241A] shadow-sm'
                }`}
              >
                <p className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${mine ? 'text-[#C9F169]' : 'text-[#5C6B60]'}`}>
                  {mine ? 'You' : thread.farmerName}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-[#8A9A8E]'}`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-[#E6EADF] bg-white p-3"
        onSubmit={(event) => {
          event.preventDefault()
          onReply()
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            rows={2}
            placeholder={
              thread.status === 'resolved'
                ? 'Send a follow-up to reopen this thread'
                : 'Reply to the farmer'
            }
            className="min-h-[44px] flex-1 resize-none rounded-2xl border border-[#E6EADF] bg-[#F6F7F2] px-3 py-2.5 text-sm outline-none focus:border-[#123524] focus:bg-white"
          />
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#123524] text-white disabled:opacity-50"
            aria-label="Send reply"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </>
  )
}
