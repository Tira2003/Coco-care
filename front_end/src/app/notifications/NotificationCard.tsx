import { useNavigate } from 'react-router'
import { X } from 'lucide-react'
import type { InboxNotification } from '@/types'
import { CATEGORY_LABEL, iconWrapClass, notificationIcon } from './presentation'
import { absoluteTime, relativeTime } from './time'

interface NotificationCardProps {
  item: InboxNotification
  compact?: boolean
  onOpen: (item: InboxNotification) => void
  onDismiss?: (item: InboxNotification) => void
}

export function NotificationCard({ item, compact = false, onOpen, onDismiss }: NotificationCardProps) {
  const navigate = useNavigate()
  const Icon = notificationIcon(item.kind, item.category)

  const open = () => {
    onOpen(item)
    if (item.href) navigate(item.href)
  }

  return (
    <article
      className={`group relative flex gap-3 rounded-2xl border bg-white transition-colors ${
        compact ? 'p-3' : 'p-3.5 sm:p-4'
      } ${
        item.read
          ? 'border-[#E6EADF] opacity-80 hover:opacity-100'
          : 'border-[#C9F169]/80 shadow-[0_1px_2px_rgba(16,36,26,.04)]'
      }`}
    >
      {!item.read ? (
        <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-[#123524]" />
      ) : null}
      <button
        type="button"
        onClick={open}
        className="flex min-w-0 flex-1 gap-3 text-left"
      >
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${iconWrapClass(
            item.kind,
            item.category,
            item.read,
          )}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`truncate text-sm text-[#10241A] ${item.read ? 'font-medium' : 'font-bold'}`}>
              {item.title}
            </h3>
            <span className="rounded-full bg-[#F6F7F2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5C6B60]">
              {CATEGORY_LABEL[item.category]}
            </span>
          </div>
          <p
            className={`mt-1 text-sm leading-relaxed text-[#5C6B60] ${
              compact ? 'line-clamp-2' : 'whitespace-pre-wrap'
            }`}
          >
            {item.message}
          </p>
          <time
            className="mt-2 block text-[11px] text-[#8A9A8E]"
            dateTime={item.createdAt}
            title={absoluteTime(item.createdAt)}
          >
            {relativeTime(item.createdAt)}
          </time>
        </div>
      </button>
      {onDismiss ? (
        <button
          type="button"
          onClick={() => onDismiss(item)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8A9A8E] hover:bg-[#F1F5EA] hover:text-[#10241A]"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </article>
  )
}
