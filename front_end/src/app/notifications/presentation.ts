import type { InboxCategory, InboxKind } from '@/types'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Megaphone,
  MessageSquare,
} from 'lucide-react'

export const CATEGORY_LABEL: Record<InboxCategory, string> = {
  outbreak: 'Outbreak',
  report: 'Report',
  announcement: 'Announcement',
  consultation: 'Message',
}

export function notificationIcon(kind: InboxKind, category: InboxCategory) {
  if (category === 'consultation') return MessageSquare
  if (category === 'announcement') return Megaphone
  if (kind === 'success') return CheckCircle2
  if (kind === 'alert') return AlertTriangle
  return Bell
}

export function iconWrapClass(kind: InboxKind, category: InboxCategory, read: boolean) {
  if (category === 'consultation') return read ? 'bg-[#EDF3E0] text-[#2E5A27]' : 'bg-[#123524] text-[#C9F169]'
  if (kind === 'success') return 'bg-[#E1F3E8] text-[#1E7A44]'
  if (kind === 'alert') return 'bg-[#FDE7E8] text-[#B3261E]'
  if (category === 'announcement') return 'bg-[#E8F0FE] text-[#1D4ED8]'
  return 'bg-[#FCF0DA] text-[#8A5A00]'
}
