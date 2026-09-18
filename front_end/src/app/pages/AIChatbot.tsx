import {
  Send,
  Loader2,
  BookOpen,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeft,
  X,
  FileText,
  Mic,
  Leaf,
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
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isConversationId(value: string | null): value is string {
  return Boolean(value && UUID_RE.test(value))
}

const WELCOME_MESSAGE =
  'Hello! I am Coco AI. Ask me anything about coconut farming, diseases, or fertilizer.'

function isWelcomeMessage(message: ChatMessage) {
  return message.role === 'assistant' && message.content.trim() === WELCOME_MESSAGE
}

function withWelcome(
  messages: ChatMessage[],
  conversationId: string | null,
  createdAt: string,
): ChatMessage[] {
  if (messages.some(isWelcomeMessage)) return messages
  return [
    {
      id: conversationId ? `welcome-${conversationId}` : 'welcome-local',
      conversationId: conversationId ?? '',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      createdAt,
    },
    ...messages,
  ]
}

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

function toPlainChatText(text: string) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[^\w/])\*(?!\s)([^*\n]+?)\*(?=$|[^\w])/g, '$1$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^[ \t]*[-*+]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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

  return (
    <div>
      <div className="whitespace-pre-wrap">{toPlainChatText(body)}</div>
      {sourceTitle ? (
        <div className="mt-2.5 pt-2 border-t border-[#E6EADF]/60">
          <button
            type="button"
            onClick={() => onOpenSource?.(sourceTitle)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF3E0] px-3 py-1 text-[11px] font-bold text-[#2E4A38] border border-transparent hover:border-[#7FA81B] transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#7FA81B]" />
            <span>Source: {sourceTitle}</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function AIChatbot() {
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(() => {
    const stored = localStorage.getItem(ACTIVE_CHAT_KEY)
    return isConversationId(stored) ? stored : null
  })
  const activeIdRef = useRef<string | null>(activeId)
  const [input, setInput] = useState('')
  const [sendError, setSendError] = useState('')
  const [articleOpen, setArticleOpen] = useState(false)
  const [articleTitle, setArticleTitle] = useState<string | null>(null)
  const [article, setArticle] = useState<KnowledgeArticle | null>(null)
  const [articleLoading, setArticleLoading] = useState(false)
  const [articleError, setArticleError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
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
  const [welcomeClock] = useState(() => new Date().toISOString())
  const welcomeCreatedAt =
    conversations.find((c) => c.id === activeId)?.createdAt ?? welcomeClock
  const displayedMessages = withWelcome(messages, activeId, welcomeCreatedAt)

  /** Drop drafts with no user messages when leaving them. Never delete the active draft. */
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
    if (conversationsLoading) return
    if (conversations.length === 0) {
      if (activeIdRef.current) {
        activeIdRef.current = null
        setActiveId(null)
        localStorage.removeItem(ACTIVE_CHAT_KEY)
      }
      return
    }
    const exists = activeIdRef.current && conversations.some((c) => c.id === activeIdRef.current)
    if (!exists) {
      openConversation(conversations[0].id)
    }
  }, [conversations, conversationsLoading, activeId])

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
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      return chatApi.send(conversationId, message)
    },
    onSuccess: (data) => {
      setSendError('')
      if (data && activeIdRef.current) {
        queryClient.setQueryData<ChatMessage[]>(
          ['chat', 'messages', activeIdRef.current],
          (old) => {
            const list = old ?? []
            if (list.some((m) => m.id === data.id)) return list
            return [...list, data]
          },
        )
      }
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', activeIdRef.current] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
    onError: () => {
      setSendError('Could not reach the CRI assistant. Please try again.')
    },
  })

  const sendMessage = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed || sendMutation.isPending) return
    let targetId = isConversationId(activeId) ? activeId : null
    if (!targetId) {
      try {
        const newConv = await chatApi.createConversation()
        queryClient.setQueryData<ChatConversation[]>(['chat', 'conversations'], (old) => {
          const list = old ?? []
          return [newConv, ...list.filter((c) => c.id !== newConv.id)]
        })
        const msgs = await chatApi.getMessages(newConv.id)
        queryClient.setQueryData(['chat', 'messages', newConv.id], msgs)
        targetId = newConv.id
        openConversation(newConv.id)
      } catch {
        setSendError('Could not start a conversation. Please try again.')
        return
      }
    }

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      conversationId: targetId,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    queryClient.setQueryData<ChatMessage[]>(['chat', 'messages', targetId], (old) => [
      ...(old ?? []),
      userMsg,
    ])

    setSendError('')
    try {
      await sendMutation.mutateAsync({ conversationId: targetId, message: trimmed })
    } catch {
      queryClient.setQueryData<ChatMessage[]>(['chat', 'messages', targetId], (old) =>
        (old ?? []).filter((m) => m.id !== userMsg.id),
      )
    }
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
    mobileScrollRef.current?.scrollTo({ top: mobileScrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [displayedMessages.length, sendMutation.isPending])

  const conversationList = (
    <div className="flex h-full flex-col bg-[#FBFCF9]">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-[#E6EADF] p-4 shrink-0">
        <span className="font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold text-[#10241A]">
          Conversations
        </span>
        <button
          type="button"
          onClick={() => {
            void startNewConversation()
            setMobileListOpen(false)
          }}
          disabled={creating}
          className="inline-flex items-center gap-1 rounded-full bg-[#C9F169] px-3 py-1 text-xs font-bold text-[#123524] transition-all hover:bg-[#d8fa7e] disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          New
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 space-y-1 overflow-y-auto p-2.5 scrollbar-thin">
        {conversationsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#123524]" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#5C6B60]">No conversations yet.</p>
        ) : (
          conversations.map((c) => {
            const isActive = c.id === activeId
            return (
              <div
                key={c.id}
                className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all text-left w-full cursor-pointer ${
                  isActive
                    ? 'bg-[#123524] text-white shadow-xs'
                    : 'text-[#5C6B60] hover:bg-[#F1F5EA] hover:text-[#10241A]'
                }`}
                onClick={() => void selectConversation(c.id)}
              >
                <MessageSquare
                  className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#C9F169]' : 'text-[#5C6B60]'}`}
                />
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-xs font-semibold ${isActive ? 'text-white' : 'text-[#10241A]'}`}>
                    {c.title}
                  </div>
                  <div className={`text-[10px] ${isActive ? 'text-white/70' : 'text-[#5C6B60]'}`}>
                    {formatConversationTime(c.updatedAt)}
                  </div>
                </div>

                <button
                  type="button"
                  title="Delete conversation"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Delete this conversation?')) {
                      deleteMutation.mutate(c.id)
                    }
                  }}
                  className={`rounded p-1 transition-opacity hover:text-red-400 ${
                    isActive ? 'text-white/60' : 'text-[#5C6B60] opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MOBILE CHATBOT VIEW (mobi.html exact native app screen)     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col h-full bg-[#F6F7F2] relative">
        {/* Mobile Header: mobi.html exact chat-hd */}
        <div className="flex shrink-0 items-center justify-between bg-white border-b border-[#E4E8DC] px-4 py-2.5 z-10">
          <div className="flex items-center gap-2.5">
            {/* Avatar with live green online dot */}
            <div className="relative w-[38px] h-[38px] shrink-0">
              <div className="w-[38px] h-[38px] rounded-full bg-[#123524] flex items-center justify-center text-[#C9F169]">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white" />
            </div>
            <div>
              <b className="block text-[14px] font-extrabold text-[#123524] leading-tight font-['Bricolage_Grotesque',Inter,sans-serif]">
                CocoBot
              </b>
              <span className="block text-[10.5px] font-semibold text-[#10B981] leading-tight mt-0.5">
                Online · answers instantly
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void startNewConversation()}
              disabled={creating}
              className="text-[11px] font-bold text-[#123524] bg-[#EDF3E0] hover:bg-[#C9F169] px-2.5 py-1 rounded-full transition-colors active:scale-95 disabled:opacity-50"
            >
              + New
            </button>
            <button
              type="button"
              onClick={() => setMobileListOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C6B60] hover:bg-[#F1F5EA] active:scale-90"
              title="Conversations"
              aria-label="Open conversation history"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {sendError ? (
          <div className="mx-3 mt-2 rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-700 shrink-0">
            {sendError}
          </div>
        ) : null}

        {/* Mobile Messages List: mobi.html msgs style */}
        <div
          ref={mobileScrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 scrollbar-none"
        >
          {/* Today badge */}
          <div className="text-center my-0.5">
            <span className="text-[10px] font-semibold text-[#8A9A8E] bg-[#EFF3E6] rounded-full px-3 py-1">
              Today
            </span>
          </div>

          {/* Greeting is stored as the first assistant message and stays in the thread. */}
          {displayedMessages.map((message) => {
            const isUser = message.role === 'user'
            if (isUser) {
              return (
                <div key={message.id} className="flex justify-end self-end max-w-[85%]">
                  <div className="bg-[#123524] text-white rounded-[18px] rounded-br-[6px] px-3.5 py-2.5 text-[13px] leading-relaxed">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              )
            }
            return (
              <div key={message.id} className="flex gap-2 items-end max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-[#123524] text-[#C9F169] flex items-center justify-center shrink-0 mb-0.5 shadow-2xs">
                  <Leaf className="w-3 h-3" />
                </div>
                <div className="bg-white border border-[#E4E8DC] rounded-[18px] rounded-bl-[6px] p-3 text-[13px] leading-relaxed text-[#2E4A2E] shadow-[0_1px_2px_rgba(16,36,26,0.05)]">
                  <MessageContent
                    content={message.content}
                    role={message.role}
                    onOpenSource={openSourceArticle}
                  />
                </div>
              </div>
            )
          })}

          {userMessageCount === 0 && (
            <div className="flex flex-wrap gap-2 pl-8 pt-0.5">
              <button
                type="button"
                onClick={() => void sendMessage('Why are leaves turning yellow?')}
                className="text-[12px] font-semibold bg-white border border-[rgba(201,241,105,0.8)] text-[#2E5A0D] rounded-full px-3 py-1.5 active:scale-95 transition-transform shadow-xs"
              >
                Why are leaves turning yellow?
              </button>
              <button
                type="button"
                onClick={() => void sendMessage('Best fertilizer schedule')}
                className="text-[12px] font-semibold bg-white border border-[rgba(201,241,105,0.8)] text-[#2E5A0D] rounded-full px-3 py-1.5 active:scale-95 transition-transform shadow-xs"
              >
                Fertilizer schedule
              </button>
              <button
                type="button"
                onClick={() => void sendMessage('Rain expected this week?')}
                className="text-[12px] font-semibold bg-white border border-[rgba(201,241,105,0.8)] text-[#2E5A0D] rounded-full px-3 py-1.5 active:scale-95 transition-transform shadow-xs"
              >
                Rain this week?
              </button>
            </div>
          )}

          {/* Typing bounce animation */}
          {sendMutation.isPending && (
            <div className="flex gap-2 items-end max-w-[85%]">
              <div className="w-6 h-6 rounded-full bg-[#123524] text-[#C9F169] flex items-center justify-center shrink-0 mb-0.5">
                <Leaf className="w-3 h-3" />
              </div>
              <div className="bg-white border border-[#E4E8DC] rounded-[18px] rounded-bl-[6px] px-3.5 py-2.5 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8E] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8E] animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A8E] animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Input Bar: mobi.html exact inputbar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSend()
          }}
          className="flex-shrink-0 bg-white border-t border-[#E4E8DC] px-3 py-2 flex items-center gap-2 z-20"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your coconut farm…"
            autoComplete="off"
            className="flex-1 bg-[#F6F7F2] border border-transparent focus:border-[#C9F169] rounded-full px-4 py-2 text-[13.5px] text-[#123524] placeholder-[#8A9A8E] outline-none"
          />
          <button
            type="button"
            onClick={() => alert('Voice input coming soon 🎤')}
            className="w-9 h-9 rounded-full bg-[#F6F7F2] flex items-center justify-center text-[#123524] shrink-0 active:scale-90 transition-transform"
            title="Voice input"
            aria-label="Voice input"
          >
            <Mic className="w-4 h-4 text-[#123524]" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || sendMutation.isPending}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all ${
              input.trim()
                ? 'bg-[#C9F169] text-[#123524] shadow-xs'
                : 'bg-[#E8EDE0] text-[#8A9A8E]'
            }`}
            title="Send"
            aria-label="Send message"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#123524]" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DESKTOP CHATBOT VIEW (Unchanged split layout)              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex h-[calc(100dvh-7.5rem)] min-h-[520px] overflow-hidden rounded-[20px] border border-[#E6EADF] bg-white shadow-[0_1px_2px_rgba(16,36,26,.04),0_6px_20px_rgba(16,36,26,.05)]">
        {/* Desktop sidebar */}
        <aside className="w-[280px] shrink-0 border-r border-[#E6EADF] flex flex-col">
          {conversationList}
        </aside>


      {/* Main chat column */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {/* Chat top header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E6EADF] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileListOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E6EADF] text-[#5C6B60] hover:bg-[#F1F5EA] md:hidden"
              aria-label="Open conversations"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#123524] text-base shadow-2xs">
              🤖
            </div>
            <div className="min-w-0">
              <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] truncate text-sm sm:text-base font-bold text-[#10241A]">
                Coco Care AI Assistant
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-[#5C6B60]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3DA35D]" />
                <span className="truncate">CRI-grounded knowledge base</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#EDF3E0] px-3 py-1 text-[11px] font-bold text-[#2E4A38]">
            <FileText className="h-3.5 w-3.5 text-[#7FA81B]" />
            <span>CRI Advisory</span>
          </div>
        </div>

        {sendError ? (
          <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:mx-6">
            {sendError}
          </div>
        ) : null}

        {/* Message Stream */}
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin"
        >
          {messagesLoading ? (
            <div className="my-auto flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
            </div>
          ) : (
            <>
              {displayedMessages.map((message) => {
                const isUser = message.role === 'user'
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-[18px] px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#123524] text-white rounded-br-[4px]'
                          : 'bg-[#F6F7F2] border border-[#E6EADF] text-[#10241A] rounded-bl-[4px]'
                      }`}
                    >
                      <MessageContent
                        content={message.content}
                        role={message.role}
                        onOpenSource={openSourceArticle}
                      />
                      <div
                        className={`mt-1.5 text-[10px] ${
                          isUser ? 'text-[#AEC0A6]' : 'text-[#5C6B60]'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
              {userMessageCount === 0 ? (
                <div className="flex max-w-2xl flex-wrap gap-2 pt-1">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={sendMutation.isPending}
                      onClick={() => void sendMessage(q)}
                      className="rounded-full border border-[#E6EADF] bg-white px-3.5 py-1.5 text-xs font-medium text-[#10241A] transition-colors hover:border-[#7FA81B] hover:bg-[#EDF3E0] hover:text-[#123524] disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}

          {/* Typing Indicator */}
          {sendMutation.isPending ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-[18px] rounded-bl-[4px] border border-[#E6EADF] bg-[#F6F7F2] px-4 py-3 text-xs text-[#5C6B60]">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5C6B60] [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5C6B60] [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5C6B60]" />
                </span>
                <span>Searching CRI advisory knowledge base…</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Suggestion pills if there are messages */}
        {activeId && userMessageCount > 0 && !sendMutation.isPending && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 sm:px-6 scrollbar-none">
            {suggestedQuestions.slice(0, 3).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void sendMessage(q)}
                className="shrink-0 rounded-full border border-[#E6EADF] bg-white px-3 py-1 text-[11px] font-medium text-[#5C6B60] transition-colors hover:border-[#7FA81B] hover:bg-[#EDF3E0] hover:text-[#123524]"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Composer Form matching dashboard.html */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSend()
          }}
          className="flex items-center gap-2.5 border-t border-[#E6EADF] bg-white p-3 sm:px-5 sm:py-3.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any coconut issue…"
            disabled={sendMutation.isPending}
            className="h-11 flex-1 rounded-full border border-[#E6EADF] bg-[#F6F7F2] px-4 text-xs sm:text-sm text-[#10241A] placeholder-[#5C6B60] outline-none transition-colors focus:border-[#123524] focus:bg-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMutation.isPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#123524] text-[#C9F169] transition-all hover:bg-[#0C281B] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
      </div>

      {/* Mobile conversation drawer */}
      {mobileListOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-2xs"
            aria-label="Close conversations"
            onClick={() => setMobileListOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6EADF] px-4 py-3">
              <span className="font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold text-[#10241A]">
                Conversations
              </span>
              <button
                type="button"
                onClick={() => setMobileListOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5C6B60] hover:bg-[#F1F5EA]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {conversationList}
          </aside>
        </div>
      ) : null}

      {/* Article Dialog Modal */}
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
        <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden rounded-[24px] border border-[#E6EADF] bg-white p-0 sm:max-w-2xl shadow-xl">
          <DialogHeader className="shrink-0 border-b border-[#E6EADF] p-5 pb-4">
            <DialogTitle className="font-['Bricolage_Grotesque',Inter,sans-serif] pr-8 text-lg font-bold text-[#10241A]">
              {article?.title ?? articleTitle ?? 'CRI Article'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5C6B60]">
              {article?.source
                ? `${article.source} · Full advisory from the knowledge base`
                : 'Full advisory from the CRI knowledge base'}
            </DialogDescription>
            {article?.sourceUrl ? (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-semibold text-[#123524] underline underline-offset-2 hover:text-[#7FA81B]"
              >
                Open official CRI PDF
              </a>
            ) : null}
          </DialogHeader>

          <div className="min-h-0 max-h-[70vh] flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
            {articleLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
              </div>
            ) : null}
            {articleError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {articleError}
              </div>
            ) : null}
            {article && !articleLoading ? (
              <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-[#10241A]">
                {article.content || 'No content available for this document.'}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
