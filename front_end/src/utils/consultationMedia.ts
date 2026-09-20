import { useState } from 'react'
import type { ConsultationAttachment } from '@/types'
import { compressImageForUpload } from './compressImage'

export const MAX_CONSULTATION_ATTACHMENTS = 3
export const MAX_VIDEO_BYTES = 6 * 1024 * 1024
export const MAX_VOICE_BYTES = 3 * 1024 * 1024
export const MAX_VOICE_SECONDS = 60

export function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

export function isVideoFile(file: File) {
  return file.type.startsWith('video/')
}

export function isAudioFile(file: File) {
  return file.type.startsWith('audio/')
}

export function pickAudioRecorderMime() {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read that file'))
    reader.readAsDataURL(file)
  })
}

function sanitizeName(file: File) {
  const base = file.name.replace(/\.[^.]+$/, '').trim()
  return (base || 'attachment').slice(0, 80)
}

function audioExtension(mime: string) {
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'm4a'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3'
  return 'webm'
}

export async function fileToConsultationAttachment(file: File): Promise<ConsultationAttachment> {
  if (isImageFile(file)) {
    const url = await compressImageForUpload(file, 1280, 0.82)
    return { kind: 'image', url, name: sanitizeName(file), mime: 'image/jpeg' }
  }

  if (isVideoFile(file)) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error('Videos need to be under 6 MB. Trim a short clip or send a photo instead.')
    }
    const url = await readAsDataUrl(file)
    if (url.length > 9_500_000) {
      throw new Error('That video is too large to send. Try a shorter clip.')
    }
    return {
      kind: 'video',
      url,
      name: sanitizeName(file),
      mime: file.type || 'video/mp4',
    }
  }

  if (isAudioFile(file)) {
    if (file.size > MAX_VOICE_BYTES) {
      throw new Error('Voice notes need to be under 1 minute. Record a shorter clip.')
    }
    const url = await readAsDataUrl(file)
    if (url.length > 9_500_000) {
      throw new Error('That voice note is too large to send. Try a shorter clip.')
    }
    return {
      kind: 'voice',
      url,
      name: sanitizeName(file) || 'Voice note',
      mime: file.type || 'audio/webm',
    }
  }

  throw new Error('Attach a photo, short video, or voice note.')
}

export function blobToVoiceFile(blob: Blob, seconds: number) {
  const mime = blob.type || 'audio/webm'
  const label = `Voice note ${Math.max(1, seconds)}s`
  return new File([blob], `${label}.${audioExtension(mime)}`, { type: mime })
}

export function useConsultationDraftMedia() {
  const [attachments, setAttachments] = useState<ConsultationAttachment[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const addFiles = async (list: FileList | File[] | null) => {
    if (!list || list.length === 0) return
    const files = Array.from(list)
    setError('')
    setBusy(true)
    try {
      const next = [...attachments]
      for (const file of files) {
        if (next.length >= MAX_CONSULTATION_ATTACHMENTS) {
          setError(`You can attach up to ${MAX_CONSULTATION_ATTACHMENTS} files`)
          break
        }
        if (isVideoFile(file) && next.some((item) => item.kind === 'video')) {
          setError('Send one video at a time, or add photos instead.')
          continue
        }
        if (isAudioFile(file) && next.some((item) => item.kind === 'voice')) {
          setError('Send one voice note at a time.')
          continue
        }
        next.push(await fileToConsultationAttachment(file))
      }
      setAttachments(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not attach that file.')
    } finally {
      setBusy(false)
    }
  }

  const removeAt = (index: number) => {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setError('')
  }

  const clear = () => {
    setAttachments([])
    setError('')
    setBusy(false)
  }

  return { attachments, busy, error, setError, addFiles, removeAt, clear }
}
