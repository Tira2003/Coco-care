import {
  Send,
  FileText,
  Sparkles,
  Loader2,
  BookOpen,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeft,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi, knowledgeApi } from '@/api/services'
import type { ChatMessage, ChatConversation, KnowledgeArticle } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

const ACTIVE_CHAT_KEY = 'coco_active_chat'

/** Keep in sync with backend/data/rag-suggested-questions.json */
const suggestedQuestions = [
  'How to treat bud rot disease?',
  'Best fertilizer for adult coconut trees?',
  'How much dolomite for a 1-year seedling?',
  'How to prevent red weevil damage?',
  'How to control black beetle?',
  'How to prevent caterpillar attacks?',
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatConversationTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function parseSourceTitle(content: string): { body: string; sourceTitle: string | null } {
  const sourceIdx = content.lastIndexOf('\n\nSource:')
  if (sourceIdx === -1) return { body: content, sourceTitle: null }
  const body = content.slice(0, sourceIdx)
  const sourceLine = content.slice(sourceIdx + 2).trim()
  const title = sourceLine.replace(/^Source:\s*/i, '').trim()
  return { body, sourceTitle: title || null }
}

function MessageContent({
  content,
  role,
  onOpenSource,
}: {
  content: string
  role: 'user' | 'assistant'
  onOpenSource?: (title: string) => void
}) {
  if (role === 'user') {
    return <div className="whitespace-pre-wrap">{content}</div>
  }

  const { body, sourceTitle } = parseSourceTitle(content)
  if (!sourceTitle) {
    return <div className="whitespace-pre-wrap">{content}</div>
  }

  return (
    <div>
      <div className="whitespace-pre-wrap">{body}</div>
      <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">Source:</span>
        <button
          type="button"
          onClick={() => onOpenSource?.(sourceTitle)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#2d5f2e] underline underline-offset-2 hover:text-[#1a2e1a] cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {sourceTitle}
        </button>
        <span className="text-xs text-gray-400">· Read full article</span>
      </div>
    </div>
  )
}

export function AIChatbot() {
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_CHAT_KEY),
  )
  const activeIdRef = useRef<string | null>(activeId)
  const [input, setInput] = useState('')
  const [sendError, setSendError] = useState('')
  const [articleOpen, setArticleOpen] = useState(false)
  const [articleTitle, setArticleTitle] = useState<string | null>(null)
  const [article, setArticle] = useState<KnowledgeArticle | null>(null)
  const [articleLoading, setArticleLoading] = useState(false)
  const [articleError, setArticleError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const prunedOnMount = useRef(false)

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
  } = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: chatApi.listConversations,
  })

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat', 'messages', activeId],
    queryFn: () => chatApi.getMessages(activeId!),
    enabled: !!activeId,
  })

  const userMessageCount = messages.filter((m) => m.role === 'user').length

  /** Gemini-style: drop drafts with no user messages when leaving them. Never delete the active draft (use ref — React state lags). */
  const discardEmptyDraft = async (conversationId: string) => {
    if (conversationId === activeIdRef.current) return

    let msgs = queryClient.getQueryData<ChatMessage[]>(['chat', 'messages', conversationId])
    if (!msgs) {
      try {
        msgs = await chatApi.getMessages(conversationId)
      } catch {
        return
      }
    }
    if (msgs.some((m) => m.role === 'user')) return

    try {
      await chatApi.deleteConversation(conversationId)
    } catch {
      // Already gone or network error — still remove from UI
    }

    queryClient.setQueryData<ChatConversation[]>(['chat', 'conversations'], (old) =>
      (old ?? []).filter((c) => c.id !== conversationId),
    )
    queryClient.removeQueries({ queryKey: ['chat', 'messages', conversationId] })
  }

  const openConversation = (id: string) => {
    activeIdRef.current = id
    setActiveId(id)
    localStorage.setItem(ACTIVE_CHAT_KEY, id)
    setSendError('')
    setInput('')
  }

  const selectConversation = async (id: string) => {
    if (id === activeIdRef.current) {
      setMobileListOpen(false)
      return
    }
    const leavingId = activeIdRef.current
    openConversation(id)
    setMobileListOpen(false)
    if (leavingId) {
      await discardEmptyDraft(leavingId)
    }
  }

  const [creating, setCreating] = useState(false)
  const [mobileListOpen, setMobileListOpen] = useState(false)

  const startNewConversation = async () => {
    if (creating) return

    // Already on an empty draft — keep it open (Gemini stays on blank chat)
    if (activeId && userMessageCount === 0 && !messagesLoading) {
      setInput('')
      setSendError('')
      return
    }

    setCreating(true)
    setSendError('')
    try {
      const leavingId = activeIdRef.current
      const conversation = await chatApi.createConversation()

      // Protect new draft BEFORE cache update so prune/discard cannot race-delete it
      activeIdRef.current = conversation.id

      const msgs = await chatApi.getMessages(conversation.id)
      queryClient.setQueryData(['chat', 'messages', conversation.id], msgs)
      queryClient.setQueryData<ChatConversation[]>(['chat', 'conversations'], (old) => {
        const list = old ?? []
        return [conversation, ...list.filter((c) => c.id !== conversation.id)]
      })

      openConversation(conversation.id)

      if (leavingId && leavingId !== conversation.id) {
        await discardEmptyDraft(leavingId)
      }
    } catch {
      setSendError('Could not start a new conversation. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    if (conversationsLoading || conversations.length === 0) return
    const exists = activeIdRef.current && conversations.some((c) => c.id === activeIdRef.current)
    if (!exists) {
      openConversation(conversations[0].id)
    }
  }, [conversations, conversationsLoading, activeId])

  // One-time prune of leftover empty drafts on load (never the active draft)
  useEffect(() => {
    if (conversationsLoading || conversations.length === 0 || prunedOnMount.current) return
    prunedOnMount.current = true

    const prune = async () => {
      const drafts = conversations.filter(
        (c) => c.title === 'New conversation' && c.id !== activeIdRef.current,
      )
      for (const draft of drafts) {
        await discardEmptyDraft(draft.id)
      }
    }

    void prune()
  }, [conversationsLoading, conversations])

  const deleteMutation = useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<ChatConversation[]>(['chat', 'conversations'], (old) =>
        (old ?? []).filter((c) => c.id !== deletedId),
      )
      queryClient.removeQueries({ queryKey: ['chat', 'messages', deletedId] })
      if (activeId === deletedId) {
        localStorage.removeItem(ACTIVE_CHAT_KEY)
        setActiveId(null)
      }
    },
  })

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      chatApi.send(conversationId, message),
    onSuccess: () => {
      setSendError('')
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', activeId] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      setSendError(
        message ??
          'Knowledge assistant is temporarily unavailable. Ensure the backend is running and GEMINI_API_KEY is set in backend/.env, then run npm run rag:ingest.',
      )
    },
  })

  const sendMessage = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed || sendMutation.isPending || !activeId) return
    setSendError('')
    await sendMutation.mutateAsync({ conversationId: activeId, message: trimmed })
  }

  const handleSend = async () => {
    const message = input.trim()
    if (!message) return
    setInput('')
    await sendMessage(message)
  }

  const openSourceArticle = async (title: string) => {
    setArticleTitle(title)
    setArticleOpen(true)
    setArticle(null)
    setArticleError('')
    setArticleLoading(true)
    try {
      const data = await knowledgeApi.getByTitle(title)
      setArticle(data)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      setArticleError(message ?? 'Could not load the full article.')
    } finally {
      setArticleLoading(false)
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, sendMutation.isPending])

  const conversationList = (
    <>
      <div className="border-b border-green-100 p-3">
        <button
          type="button"
          onClick={() => {
            void startNewConversation()
            setMobileListOpen(false)
          }}
          disabled={creating}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2d5f2e] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#1a2e1a] disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          New conversation
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {conversationsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#2d5f2e]" />
          </div>
        ) : (
          conversations.map((c) => {
            const isActive = c.id === activeId
            return (
              <div
                key={c.id}
                className={`group flex items-start gap-2 rounded-xl border px-2 py-2 transition-colors ${
                  isActive
                    ? 'border-green-200 bg-green-50'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => void selectConversation(c.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <MessageSquare
                      className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#2d5f2e]' : 'text-gray-400'}`}
                    />
                    <span
                      className={`truncate text-sm ${isActive ? 'font-medium text-[#1a2e1a]' : 'text-gray-700'}`}
                    >
                      {c.title}
                    </span>
                  </div>
                  <div className="pl-5 text-xs text-gray-400">
                    {formatConversationTime(c.updatedAt)}
                  </div>
                </button>
                <button
                  type="button"
                  title="Delete conversation"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Delete this conversation?')) {
                      deleteMutation.mutate(c.id)
                    }
                  }}
                  className="rounded p-2 text-gray-400 transition-opacity hover:bg-red-50 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </>
  )

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-[20rem] gap-0 overflow-hidden sm:h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-5.5rem)] lg:gap-4">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm md:flex">
        {conversationList}
      </aside>

      {/* Mobile conversation drawer */}
      {mobileListOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close conversations"
            onClick={() => setMobileListOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-green-100 px-3 py-3">
              <span className="text-sm font-semibold text-[#1a2e1a]">Conversations</span>
              <button
                type="button"
                onClick={() => setMobileListOpen(false)}
                className="flex min-h-10 min-w-10 items-center justify-center rounded-xl hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {conversationList}
          </aside>
        </div>
      ) : null}

      {/* Main chat */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
        <div className="shrink-0 border-b border-green-100 p-3 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileListOpen(true)}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-green-100 text-[#2d5f2e] hover:bg-green-50 md:hidden"
              aria-label="Open conversations"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] sm:h-12 sm:w-12">
              <Sparkles className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg text-[#1a2e1a] sm:text-2xl">AI Farming Assistant</h1>
              <div className="flex items-center gap-2 text-xs text-green-600 sm:text-sm">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-500" />
                <span className="truncate">CRI knowledge · conversation context</span>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 shrink-0 sm:flex">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-900">RAG Knowledge Base</span>
            </div>
          </div>
        </div>

        {sendError ? (
          <div className="mx-3 mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-6 sm:mt-4">
            {sendError}
          </div>
        ) : null}

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:space-y-4 sm:p-6">
          {!activeId || messagesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#2d5f2e]" />
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm sm:max-w-[80%] sm:px-4 sm:py-3 sm:text-base ${
                    message.role === 'user'
                      ? 'bg-[#2d5f2e] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <MessageContent
                    content={message.content}
                    role={message.role}
                    onOpenSource={openSourceArticle}
                  />
                  <div
                    className={`mt-1 text-xs ${
                      message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}

          {sendMutation.isPending ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin text-[#2d5f2e]" />
                Searching knowledge base…
              </div>
            </div>
          ) : null}
        </div>

        {activeId && userMessageCount === 0 && !messagesLoading ? (
          <div className="shrink-0 px-3 pb-3 sm:px-6 sm:pb-4">
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-yellow-50 p-3 sm:p-4">
              <h3 className="mb-2 text-sm text-gray-900 sm:mb-3">Suggested Questions:</h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    disabled={sendMutation.isPending}
                    onClick={() => void sendMessage(question)}
                    className="min-h-11 rounded-lg border border-green-100 bg-white px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-[#2d5f2e] disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="shrink-0 border-t border-green-100 p-3 sm:p-4">
          <div className="flex items-end gap-2 sm:items-center sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
              placeholder="Ask about coconut farming…"
              disabled={!activeId}
              className="min-h-12 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] disabled:opacity-50 sm:rounded-lg sm:px-4"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!input.trim() || sendMutation.isPending || !activeId}
              className="flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-[#2d5f2e] text-white hover:bg-[#1a2e1a] disabled:bg-gray-300 sm:rounded-lg sm:p-3"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={articleOpen}
        onOpenChange={(open) => {
          setArticleOpen(open)
          if (!open) {
            setArticle(null)
            setArticleTitle(null)
            setArticleError('')
          }
        }}
      >
        <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b border-green-100 p-4 pb-3 sm:p-6">
            <DialogTitle className="pr-8 text-[#1a2e1a]">
              {article?.title ?? articleTitle ?? 'CRI Article'}
            </DialogTitle>
            <DialogDescription>
              {article?.source
                ? `${article.source} · Full advisory from the knowledge base`
                : 'Full advisory from the CRI knowledge base'}
            </DialogDescription>
            {article?.sourceUrl ? (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#2d5f2e] underline underline-offset-2 hover:text-[#1a2e1a]"
              >
                Open official CRI PDF
              </a>
            ) : null}
          </DialogHeader>

          <div className="min-h-0 max-h-[70vh] flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {articleLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#2d5f2e]" />
              </div>
            ) : null}
            {articleError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {articleError}
              </div>
            ) : null}
            {article && !articleLoading ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {article.content || 'No content available for this document.'}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
