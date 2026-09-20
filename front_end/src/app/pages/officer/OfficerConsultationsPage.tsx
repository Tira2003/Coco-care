import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  MessageSquare,
  Mic,
  Phone,
  Play,
  Send,
  Trash2,
} from 'lucide-react'
import { officerConsultationsApi } from '@/api/services'
import {
  ConsultationDraftPreviews,
  ConsultationMessageMedia,
  ConsultationReplyAttach,
} from '@/app/components/consultations/ConsultationMedia'
import { DeleteConsultationDialog } from '@/app/components/consultations/DeleteConsultationDialog'
import { useAuth } from '@/contexts/AuthContext'
import type { ConsultationInbox, ConsultationThread } from '@/types'
import { MAX_CONSULTATION_ATTACHMENTS, useConsultationDraftMedia } from '@/utils/consultationMedia'

type Tab = 'needs_reply' | 'waiting' | 'resolved' | 'all'

function apiError(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

function formatTime(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function officerBadge(inbox: ConsultationInbox) {
  if (inbox === 'resolved') return { label: 'Resolved', className: 'bg-[#EEF1EA] text-[#5C6B60]' }
  if (inbox === 'waiting') return { label: 'Waiting on farmer', className: 'bg-[#EDF3E0] text-[#123524]' }
  return { label: 'Needs reply', className: 'bg-[#FCF0DA] text-[#8A5A00]' }
}

export function OfficerConsultationsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const assignedRegion = user?.assignedRegion?.trim()
  const [tab, setTab] = useState<Tab>('needs_reply')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const replyMedia = useConsultationDraftMedia()

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
    mutationFn: ({
      id,
      content,
      attachments,
    }: {
      id: string
      content: string
      attachments: typeof replyMedia.attachments
    }) => officerConsultationsApi.reply(id, { content, attachments }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['officer', 'consultations', updated.id], updated)
      queryClient.invalidateQueries({ queryKey: ['officer', 'consultations'] })
      setReply('')
      replyMedia.clear()
    },
  })

  const resolveMutation = useMutation({
    mutationFn: officerConsultationsApi.resolve,
    onSuccess: (updated) => {
      queryClient.setQueryData(['officer', 'consultations', updated.id], updated)
      queryClient.invalidateQueries({ queryKey: ['officer', 'consultations'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: officerConsultationsApi.remove,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['officer', 'consultations', id] })
      queryClient.invalidateQueries({ queryKey: ['officer', 'consultations'] })
      setActiveId(null)
      setConfirmDelete(false)
      setDeleteError('')
      setReply('')
      replyMedia.clear()
    },
    onError: (err) => setDeleteError(apiError(err, 'Could not delete this conversation.')),
  })

  const counts = {
    needs_reply: threads.filter((item) => item.inbox === 'needs_reply').length,
    waiting: threads.filter((item) => item.inbox === 'waiting').length,
    resolved: threads.filter((item) => item.inbox === 'resolved').length,
    all: threads.length,
  }

  if (!assignedRegion) {
    return (
      <div className="rounded-2xl border border-[#E6EADF] bg-[#FCF0DA] px-5 py-8 text-sm text-[#8A5A00]">
        No region assigned. Ask an admin to set your district so farmer consultations can reach this inbox.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B60]">
          {assignedRegion} desk
        </p>
        <h1 className="mt-1 font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold text-[#10241A]">
          Farmer consultations
        </h1>
        <p className="mt-1 text-sm text-[#5C6B60]">
          Direct messages from farmers in your assigned district. Reply with notes, photos, video, or a voice note.
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
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              tab === id
                ? 'bg-[#123524] text-white'
                : 'bg-white text-[#123524] ring-1 ring-[#E6EADF] hover:bg-[#F1F5EA]'
            }`}
          >
            {label} {counts[id]}
          </button>
        ))}
      </div>

      <div className="grid overflow-hidden rounded-[28px] border border-[#E6EADF] bg-white lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-[#E6EADF] bg-[#FBFDF8] lg:border-b-0 lg:border-r">
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
                const mediaHint = /photo|video|voice/i.test(item.lastMessage)
                const lower = item.lastMessage.toLowerCase()
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveId(item.id)
                      setReply('')
                      replyMedia.clear()
                    }}
                    className={`mb-1 w-full rounded-2xl px-3 py-3 text-left transition-colors ${
                      active ? 'bg-white shadow-sm ring-1 ring-[#D7E3C4]' : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#10241A]">{item.farmerName}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#5C6B60]">{item.topic}</p>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#8A968C]">
                      {mediaHint ? (
                        lower.includes('voice') ? (
                          <Mic className="h-3 w-3 shrink-0" />
                        ) : lower.includes('video') ? (
                          <Play className="h-3 w-3 shrink-0" />
                        ) : (
                          <ImagePlus className="h-3 w-3 shrink-0" />
                        )
                      ) : null}
                      {item.lastMessage}
                    </p>
                    <p className="mt-1 text-[11px] text-[#8A968C]">{formatTime(item.updatedAt)}</p>
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
              media={replyMedia}
              onReply={() => {
                if (replyMutation.isPending || replyMedia.busy) return
                if (!reply.trim() && replyMedia.attachments.length === 0) return
                replyMutation.mutate({
                  id: thread.id,
                  content: reply.trim(),
                  attachments: replyMedia.attachments,
                })
              }}
              onResolve={() => resolveMutation.mutate(thread.id)}
              onDelete={() => {
                setDeleteError('')
                setConfirmDelete(true)
              }}
              bottomRef={bottomRef}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
                Select a farmer thread
              </h2>
              <p className="mt-1 max-w-sm text-sm text-[#5C6B60]">
                Open a request to reply with advice, a photo, video, or a voice note.
              </p>
            </div>
          )}
        </section>
      </div>
      <DeleteConsultationDialog
        open={confirmDelete}
        topic={thread?.topic}
        deleting={deleteMutation.isPending}
        error={deleteError}
        onClose={() => {
          if (deleteMutation.isPending) return
          setConfirmDelete(false)
        }}
        onConfirm={() => activeId && deleteMutation.mutate(activeId)}
      />
    </div>
  )
}

function OfficerThread({
  thread,
  reply,
  setReply,
  sending,
  resolving,
  media,
  onReply,
  onResolve,
  onDelete,
  bottomRef,
}: {
  thread: ConsultationThread
  reply: string
  setReply: (value: string) => void
  sending: boolean
  resolving: boolean
  media: ReturnType<typeof useConsultationDraftMedia>
  onReply: () => void
  onResolve: () => void
  onDelete: () => void
  bottomRef: React.RefObject<HTMLDivElement | null>
}) {
  const badge = officerBadge(thread.inbox)
  const canSend = Boolean(reply.trim() || media.attachments.length > 0)
  return (
    <>
      <header className="border-b border-[#E6EADF] px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-base font-bold text-[#10241A]">
                {thread.farmerName}
              </h2>
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
            <p className="mt-1 text-sm font-medium text-[#10241A]">{thread.topic}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row">
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
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-full border border-[#E6EADF] px-3 py-1.5 text-xs font-semibold text-[#B42318] hover:bg-[#FDECEC]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
        {thread.reportLabel ? (
          <p className="mt-3 rounded-xl bg-[#EDF3E0] px-3 py-2 text-xs text-[#123524]">
            Attached diagnosis: {thread.reportLabel}
            {thread.reportStatus ? ` · ${thread.reportStatus}` : ''}
          </p>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F6F7F2] p-4">
        {thread.messages.map((message) => {
          const mine = message.senderRole === 'officer'
          const attachments = message.attachments ?? []
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
                {message.content ? <p className="whitespace-pre-wrap">{message.content}</p> : null}
                <ConsultationMessageMedia attachments={attachments} mine={mine} />
                <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-[#8A968C]'}`}>
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
        {media.attachments.length > 0 ? (
          <div className="mb-2">
            <ConsultationDraftPreviews attachments={media.attachments} onRemove={media.removeAt} />
          </div>
        ) : null}
        {media.error ? <p className="mb-2 text-xs text-[#B42318]">{media.error}</p> : null}
        <div className="flex flex-wrap items-end gap-1">
          <ConsultationReplyAttach
            busy={media.busy}
            remaining={MAX_CONSULTATION_ATTACHMENTS - media.attachments.length}
            hasVideo={media.attachments.some((item) => item.kind === 'video')}
            hasVoice={media.attachments.some((item) => item.kind === 'voice')}
            onFiles={media.addFiles}
          />
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            rows={2}
            placeholder={
              thread.status === 'resolved'
                ? 'Send a follow-up to reopen this thread'
                : 'Reply with advice, a photo, video, or voice note'
            }
            className="min-h-[44px] flex-1 resize-none rounded-2xl border border-[#E6EADF] px-3 py-2.5 text-sm outline-none focus:border-[#123524]"
          />
          <button
            type="submit"
            disabled={sending || media.busy || !canSend}
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
