import { useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2, Mic, Play, X } from 'lucide-react'
import type { ConsultationAttachment } from '@/types'
import { MAX_CONSULTATION_ATTACHMENTS } from '@/utils/consultationMedia'
import { ConsultationVoiceButton } from './ConsultationVoice'

function VoicePreview({
  item,
  onRemove,
}: {
  item: ConsultationAttachment
  onRemove?: () => void
}) {
  return (
    <div className="relative rounded-2xl bg-[#EDF3E0] px-3 py-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#123524] text-white">
          <Mic className="h-3.5 w-3.5" />
        </span>
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-[#123524]">{item.name}</p>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10241A]/80 text-white"
            aria-label={`Remove ${item.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      <audio src={item.url} controls preload="metadata" className="w-full" />
    </div>
  )
}

function AttachmentPreview({
  item,
  onRemove,
}: {
  item: ConsultationAttachment
  onRemove?: () => void
}) {
  if (item.kind === 'voice') {
    return <VoicePreview item={item} onRemove={onRemove} />
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-black/5">
      {item.kind === 'video' ? (
        <div className="relative">
          <video src={item.url} className="h-28 w-full object-cover" muted playsInline preload="metadata" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white">
              <Play className="h-4 w-4 fill-current" />
            </span>
          </span>
        </div>
      ) : (
        <img src={item.url} alt={item.name} className="h-28 w-full object-cover" />
      )}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#10241A]/80 text-white"
          aria-label={`Remove ${item.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
      <p className="truncate px-2 py-1 text-[10px] font-medium text-[#5C6B60]">{item.name}</p>
    </div>
  )
}

export function ConsultationDraftPreviews({
  attachments,
  onRemove,
}: {
  attachments: ConsultationAttachment[]
  onRemove: (index: number) => void
}) {
  if (attachments.length === 0) return null
  const voices = attachments
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.kind === 'voice')
  const visuals = attachments
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.kind !== 'voice')

  return (
    <div className="space-y-2">
      {voices.map(({ item, index }) => (
        <VoicePreview key={`${item.name}-${index}`} item={item} onRemove={() => onRemove(index)} />
      ))}
      {visuals.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {visuals.map(({ item, index }) => (
            <AttachmentPreview
              key={`${item.name}-${index}`}
              item={item}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ConsultationMediaPicker({
  attachments,
  busy,
  error,
  onFiles,
  onRemove,
}: {
  attachments: ConsultationAttachment[]
  busy: boolean
  error?: string
  onFiles: (files: FileList | File[] | null) => void
  onRemove: (index: number) => void
}) {
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const remaining = MAX_CONSULTATION_ATTACHMENTS - attachments.length
  const hasVoice = attachments.some((item) => item.kind === 'voice')
  const hasVideo = attachments.some((item) => item.kind === 'video')

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[#10241A]">Photos, video, or voice</p>
      <div
        className="rounded-2xl border border-dashed border-[#D7E3C4] bg-[#FBFDF8] p-3"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          if (remaining <= 0 || busy) return
          onFiles(event.dataTransfer.files)
        }}
      >
        {attachments.length > 0 ? (
          <ConsultationDraftPreviews attachments={attachments} onRemove={onRemove} />
        ) : (
          <div className="flex flex-col items-center px-3 py-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
              <ImagePlus className="h-5 w-5" />
            </div>
            <p className="mt-2 text-sm font-semibold text-[#10241A]">Show the officer what you see</p>
            <p className="mt-1 text-xs text-[#5C6B60]">
              Add up to {MAX_CONSULTATION_ATTACHMENTS} photos, one short video, or a voice note.
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={busy || remaining <= 0}
            onClick={() => photoRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#123524] ring-1 ring-[#D7E3C4] hover:bg-[#EDF3E0] disabled:opacity-50"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Photo
          </button>
          <button
            type="button"
            disabled={busy || remaining <= 0}
            onClick={() => cameraRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#123524] ring-1 ring-[#D7E3C4] hover:bg-[#EDF3E0] disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            Camera
          </button>
          <button
            type="button"
            disabled={busy || remaining <= 0 || hasVideo}
            onClick={() => videoRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#123524] ring-1 ring-[#D7E3C4] hover:bg-[#EDF3E0] disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Video
          </button>
          <ConsultationVoiceButton
            busy={busy}
            hasVoice={hasVoice}
            remaining={remaining}
            variant="chip"
            onVoice={(file) => onFiles([file])}
          />
        </div>
        {busy ? (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#5C6B60]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Preparing media…
          </p>
        ) : null}
      </div>
      {error ? <p className="mt-1.5 text-sm text-[#B42318]">{error}</p> : null}

      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          onFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          onFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          onFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}

export function ConsultationReplyAttach({
  busy,
  disabled,
  hasVideo,
  hasVoice,
  remaining,
  onFiles,
}: {
  busy: boolean
  disabled?: boolean
  hasVideo: boolean
  hasVoice: boolean
  remaining: number
  onFiles: (files: FileList | File[] | null) => void
}) {
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const locked = busy || disabled || remaining <= 0

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        disabled={locked}
        onClick={() => photoRef.current?.click()}
        className="flex h-10 w-10 items-center justify-center rounded-full text-[#123524] hover:bg-[#EDF3E0] disabled:opacity-40"
        aria-label="Attach photo"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      </button>
      <button
        type="button"
        disabled={locked || hasVideo}
        onClick={() => videoRef.current?.click()}
        className="flex h-10 w-10 items-center justify-center rounded-full text-[#123524] hover:bg-[#EDF3E0] disabled:opacity-40"
        aria-label="Attach video"
      >
        <Play className="h-4 w-4" />
      </button>
      <ConsultationVoiceButton
        busy={busy}
        disabled={disabled}
        hasVoice={hasVoice}
        remaining={remaining}
        onVoice={(file) => onFiles([file])}
      />
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          onFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          onFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}

export function ConsultationMessageMedia({
  attachments,
  mine,
}: {
  attachments: ConsultationAttachment[]
  mine?: boolean
}) {
  const [open, setOpen] = useState<ConsultationAttachment | null>(null)
  if (!attachments?.length) return null

  return (
    <>
      <div className={`mt-2 grid gap-2 ${attachments.filter((item) => item.kind !== 'voice').length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {attachments.map((item, index) => {
          if (item.kind === 'voice') {
            return (
              <div
                key={`${item.name}-${index}`}
                className={`rounded-xl px-2 py-2 ${mine ? 'bg-white/10' : 'bg-[#EDF3E0]'}`}
              >
                <p className={`mb-1 flex items-center gap-1 text-[11px] font-semibold ${mine ? 'text-[#C9F169]' : 'text-[#123524]'}`}>
                  <Mic className="h-3 w-3" />
                  Voice note
                </p>
                <audio src={item.url} controls preload="metadata" className="w-full" />
              </div>
            )
          }
          if (item.kind === 'video') {
            return (
              <video
                key={`${item.name}-${index}`}
                src={item.url}
                controls
                playsInline
                preload="metadata"
                className="max-h-56 w-full rounded-xl bg-black"
              />
            )
          }
          return (
            <button
              key={`${item.name}-${index}`}
              type="button"
              onClick={() => setOpen(item)}
              className="overflow-hidden rounded-xl"
            >
              <img src={item.url} alt={item.name} className="max-h-56 w-full object-cover" />
            </button>
          )
        })}
      </div>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10241A]/80 p-4"
          onClick={() => setOpen(null)}
          aria-label="Close photo"
        >
          <img
            src={open.url}
            alt={open.name}
            className={`max-h-[90vh] max-w-full rounded-2xl ${mine ? 'ring-2 ring-white/40' : ''}`}
          />
        </button>
      ) : null}
    </>
  )
}
