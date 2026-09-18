import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  UserRound,
} from 'lucide-react'
import { consultationsApi, farmApi, reportsApi } from '@/api/services'
import { CONSULTATION_TOPICS } from '@/app/consultations'
import type { ConsultationInbox, ConsultationSummary, ConsultationThread } from '@/types'

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

function farmerBadge(inbox: ConsultationInbox) {
  if (inbox === 'resolved') return { label: 'Resolved', className: 'bg-[#EEF1EA] text-[#5C6B60]' }
  if (inbox === 'waiting') return { label: 'Officer replied', className: 'bg-[#EDF3E0] text-[#123524]' }
  return { label: 'Waiting for officer', className: 'bg-[#FCF0DA] text-[#8A5A00]' }
}

export function OfficerConsultations() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [composing, setComposing] = useState(() => Boolean(searchParams.get('reportId') || searchParams.get('topic')))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [topic, setTopic] = useState(searchParams.get('topic') || CONSULTATION_TOPICS[0])
  const [farmId, setFarmId] = useState(searchParams.get('farmId') || '')
  const [reportId, setReportId] = useState(searchParams.get('reportId') || '')
  const [draft, setDraft] = useState('')
  const [reply, setReply] = useState('')
  const [formError, setFormError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: profile } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })
  const farms = profile?.farms ?? []

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', 'my'],
    queryFn: reportsApi.my,
  })

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: consultationsApi.list,
    refetchInterval: 12_000,
  })

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['consultations', activeId],
    queryFn: () => consultationsApi.get(activeId!),
    enabled: Boolean(activeId),
    refetchInterval: activeId ? 8_000 : false,
  })

  useEffect(() => {
    if (farmId || farms.length === 0) return
    const fromReport = reports.find((item) => item.id === reportId)
    setFarmId(fromReport?.farmId ?? farms[0]?.id ?? '')
  }, [farmId, farms, reportId, reports])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages.length, composing])

  const selectedFarm = farms.find((farm) => farm.id === farmId) ?? farms[0]
  const district = selectedFarm?.location.trim() || 'your district'

  const createMutation = useMutation({
    mutationFn: consultationsApi.create,
    onSuccess: (created) => {
      queryClient.setQueryData(['consultations', created.id], created)
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      setActiveId(created.id)
      setComposing(false)
      setDraft('')
      setFormError('')
      setSearchParams({}, { replace: true })
    },
    onError: (err) => setFormError(apiError(err, 'Could not send this request.')),
  })

  const replyMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      consultationsApi.reply(id, content),
    onSuccess: (updated) => {
      queryClient.setQueryData(['consultations', updated.id], updated)
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      setReply('')
    },
  })

  const resolveMutation = useMutation({
    mutationFn: consultationsApi.resolve,
    onSuccess: (updated) => {
      queryClient.setQueryData(['consultations', updated.id], updated)
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
    },
  })

  const startNew = () => {
    setActiveId(null)
    setComposing(true)
    setFormError('')
  }

  const openThread = (id: string) => {
    setActiveId(id)
    setComposing(false)
  }

  const submitRequest = () => {
    const message = draft.trim()
    if (message.length < 8) {
      setFormError('Write a short note so the officer knows what you need.')
      return
    }
    createMutation.mutate({
      topic,
      message,
      farmId: farmId || undefined,
      reportId: reportId || undefined,
    })
  }

  const submitReply = () => {
    if (!activeId || !reply.trim() || replyMutation.isPending) return
    replyMutation.mutate({ id: activeId, content: reply.trim() })
  }

  const showList = !composing && !activeId
  const attachedReport = reports.find((item) => item.id === reportId)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden md:h-[calc(100dvh-7.5rem)] md:min-h-[520px] lg:rounded-[28px] lg:border lg:border-[#E6EADF] lg:bg-white">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={`w-full shrink-0 flex-col border-[#E6EADF] bg-[#FBFDF8] lg:flex lg:w-[320px] lg:border-r ${
            showList ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="border-b border-[#E6EADF] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B60]">
              Regional officer
            </p>
            <h1 className="mt-1 font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              Officer consultations
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-[#5C6B60]">
              A real agricultural officer for {district}. Coco AI stays in Chat.
            </p>
            <button
              type="button"
              onClick={startNew}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#123524] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0C281B]"
            >
              <Plus className="h-4 w-4" />
              New request
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-sm text-[#5C6B60]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading threads
              </div>
            ) : threads.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-[#5C6B60]">
                No officer threads yet. Start with a farm, a scan, or a short question.
              </p>
            ) : (
              threads.map((item) => (
                <ThreadPreview
                  key={item.id}
                  item={item}
                  active={item.id === activeId}
                  onClick={() => openThread(item.id)}
                />
              ))
            )}
          </div>
        </aside>

        <section className={`min-w-0 flex-1 flex-col bg-white ${showList ? 'hidden lg:flex' : 'flex'}`}>
          {composing ? (
            <Composer
              topic={topic}
              setTopic={setTopic}
              farmId={farmId}
              setFarmId={setFarmId}
              reportId={reportId}
              setReportId={setReportId}
              farms={farms}
              reports={reports}
              draft={draft}
              setDraft={setDraft}
              district={district}
              attachedLabel={attachedReport?.finalResult}
              error={formError}
              submitting={createMutation.isPending}
              onBack={() => {
                setComposing(false)
                setSearchParams({}, { replace: true })
              }}
              onSubmit={submitRequest}
            />
          ) : threadLoading && activeId ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[#5C6B60]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opening thread
            </div>
          ) : thread ? (
            <ThreadView
              thread={thread}
              reply={reply}
              setReply={setReply}
              sending={replyMutation.isPending}
              resolving={resolveMutation.isPending}
              onBack={() => setActiveId(null)}
              onReply={submitReply}
              onResolve={() => resolveMutation.mutate(thread.id)}
              bottomRef={bottomRef}
            />
          ) : (
            <EmptyPane onCompose={startNew} />
          )}
        </section>
      </div>
    </div>
  )
}

function ThreadPreview({
  item,
  active,
  onClick,
}: {
  item: ConsultationSummary
  active: boolean
  onClick: () => void
}) {
  const badge = farmerBadge(item.inbox)
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 w-full rounded-2xl px-3 py-3 text-left transition-colors ${
        active ? 'bg-white shadow-sm ring-1 ring-[#D7E3C4]' : 'hover:bg-white/80'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold text-[#10241A]">{item.topic}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <p className="mt-1 truncate text-xs text-[#5C6B60]">{item.lastMessage || item.district}</p>
      <p className="mt-1 text-[11px] text-[#8A968C]">{formatTime(item.updatedAt)}</p>
    </button>
  )
}

function Composer({
  topic,
  setTopic,
  farmId,
  setFarmId,
  reportId,
  setReportId,
  farms,
  reports,
  draft,
  setDraft,
  district,
  attachedLabel,
  error,
  submitting,
  onBack,
  onSubmit,
}: {
  topic: string
  setTopic: (value: string) => void
  farmId: string
  setFarmId: (value: string) => void
  reportId: string
  setReportId: (value: string) => void
  farms: Array<{ id: string; name: string; location: string }>
  reports: Array<{ id: string; farmId: string; finalResult?: string; createdAt: string }>
  draft: string
  setDraft: (value: string) => void
  district: string
  attachedLabel?: string
  error: string
  submitting: boolean
  onBack: () => void
  onSubmit: () => void
}) {
  const farmReports = useMemo(
    () => reports.filter((item) => !farmId || item.farmId === farmId).slice(0, 12),
    [farmId, reports],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-[#E6EADF] px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-[#5C6B60] hover:bg-[#F1F5EA] lg:hidden"
          aria-label="Back to threads"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-[#10241A]">Ask your regional officer</h2>
          <p className="text-xs text-[#5C6B60]">Routed to {district}</p>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-xl space-y-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#5C6B60]">Topic</p>
            <div className="flex flex-wrap gap-2">
              {CONSULTATION_TOPICS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    topic === item
                      ? 'bg-[#123524] text-white'
                      : 'bg-[#EDF3E0] text-[#123524] hover:bg-[#E2EBCF]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {farms.length > 1 ? (
            <label className="block text-sm font-medium text-[#10241A]">
              Farm
              <select
                value={farmId}
                onChange={(event) => {
                  setFarmId(event.target.value)
                  setReportId('')
                }}
                className="mt-1.5 w-full rounded-2xl border border-[#E6EADF] bg-white px-3 py-2.5 text-sm"
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name} · {farm.location}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block text-sm font-medium text-[#10241A]">
            Attach a recent scan (optional)
            <select
              value={reportId}
              onChange={(event) => setReportId(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-[#E6EADF] bg-white px-3 py-2.5 text-sm"
            >
              <option value="">No scan attached</option>
              {farmReports.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.finalResult ?? 'Diagnosis'} · {formatTime(item.createdAt)}
                </option>
              ))}
            </select>
          </label>

          {attachedLabel ? (
            <p className="rounded-2xl bg-[#EDF3E0] px-3 py-2 text-xs text-[#123524]">
              This officer will see your scan result: {attachedLabel}
            </p>
          ) : null}

          <label className="block text-sm font-medium text-[#10241A]">
            Message
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={6}
              placeholder="Describe what you are seeing on the palm, when it started, and how many trees are affected."
              className="mt-1.5 w-full resize-none rounded-2xl border border-[#E6EADF] bg-white px-3 py-3 text-sm leading-relaxed outline-none focus:border-[#123524]"
            />
          </label>

          {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || farms.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#123524] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0C281B] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send to {district} officer
          </button>
          {farms.length === 0 ? (
            <p className="text-center text-xs text-[#5C6B60]">
              <Link to="/app/profile" className="font-semibold underline">
                Add a farm
              </Link>{' '}
              so we can route this to the right district.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ThreadView({
  thread,
  reply,
  setReply,
  sending,
  resolving,
  onBack,
  onReply,
  onResolve,
  bottomRef,
}: {
  thread: ConsultationThread
  reply: string
  setReply: (value: string) => void
  sending: boolean
  resolving: boolean
  onBack: () => void
  onReply: () => void
  onResolve: () => void
  bottomRef: React.RefObject<HTMLDivElement | null>
}) {
  const badge = farmerBadge(thread.inbox)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-[#E6EADF] px-4 py-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 rounded-full p-2 text-[#5C6B60] hover:bg-[#F1F5EA] lg:hidden"
            aria-label="Back to threads"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-bold text-[#10241A]">{thread.topic}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#5C6B60]">
              <MapPin className="h-3 w-3" />
              {thread.farmName ?? 'Farm'} · {thread.district}
              {thread.officerName ? ` · ${thread.officerName}` : ' · Officer not assigned yet'}
            </p>
          </div>
          {thread.status === 'open' ? (
            <button
              type="button"
              onClick={onResolve}
              disabled={resolving}
              className="shrink-0 rounded-full border border-[#E6EADF] px-3 py-1.5 text-xs font-semibold text-[#123524] hover:bg-[#F1F5EA] disabled:opacity-60"
            >
              {resolving ? 'Closing...' : 'Mark resolved'}
            </button>
          ) : null}
        </div>
        {thread.reportLabel ? (
          <p className="mt-2 rounded-xl bg-[#EDF3E0] px-3 py-2 text-xs text-[#123524]">
            Attached scan: {thread.reportLabel}
          </p>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F6F7F2] p-4">
        {thread.messages.map((message) => {
          const mine = message.senderRole === 'farmer'
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
                  {mine ? 'You' : thread.officerName ?? 'Officer'}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
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
        <div className="flex items-end gap-2">
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            rows={2}
            placeholder={
              thread.status === 'resolved'
                ? 'Send a follow-up to reopen this thread'
                : 'Reply to your officer'
            }
            className="min-h-[44px] flex-1 resize-none rounded-2xl border border-[#E6EADF] px-3 py-2.5 text-sm outline-none focus:border-[#123524]"
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
    </div>
  )
}

function EmptyPane({ onCompose }: { onCompose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
        <UserRound className="h-7 w-7" />
      </div>
      <h2 className="mt-4 font-['Bricolage_Grotesque',Inter,sans-serif] text-xl font-bold text-[#10241A]">
        Talk to a real officer
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#5C6B60]">
        Coco AI answers CRI manuals. Use this thread when you need a regional officer to look at a scan, a farm visit, or an outbreak nearby.
      </p>
      <button
        type="button"
        onClick={onCompose}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#123524] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0C281B]"
      >
        <MessageSquare className="h-4 w-4" />
        Start a consultation
      </button>
      <p className="mt-4 flex items-center gap-1 text-xs text-[#5C6B60]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Routed by your farm district
      </p>
    </div>
  )
}
