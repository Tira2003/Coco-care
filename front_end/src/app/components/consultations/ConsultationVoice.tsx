import { useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Square, X } from 'lucide-react'
import {
  MAX_VOICE_SECONDS,
  blobToVoiceFile,
  pickAudioRecorderMime,
} from '@/utils/consultationMedia'

function formatMmSs(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function ConsultationVoiceButton({
  busy,
  disabled,
  hasVoice,
  remaining,
  variant = 'icon',
  onVoice,
}: {
  busy: boolean
  disabled?: boolean
  hasVoice: boolean
  remaining: number
  variant?: 'icon' | 'chip'
  onVoice: (file: File) => void | Promise<void>
}) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const secondsRef = useRef(0)
  const ignoreStopRef = useRef(false)

  const cleanupStream = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
    secondsRef.current = 0
    setRecording(false)
    setSeconds(0)
  }

  useEffect(() => () => cleanupStream(), [])

  const finish = async (blob: Blob, duration: number) => {
    cleanupStream()
    if (!blob.size) {
      setError('Could not capture that voice note. Try again.')
      return
    }
    await onVoice(blobToVoiceFile(blob, duration))
  }

  const stopRecorder = () => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    recorder.stop()
  }

  const cancel = () => {
    ignoreStopRef.current = true
    stopRecorder()
    cleanupStream()
  }

  const start = async () => {
    setError('')
    if (busy || disabled || hasVoice || remaining <= 0) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice notes are not supported in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = pickAudioRecorderMime()
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      ignoreStopRef.current = false
      secondsRef.current = 0

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        if (ignoreStopRef.current) return
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mime || 'audio/webm',
        })
        void finish(blob, Math.max(1, secondsRef.current))
      }

      recorder.start(250)
      setRecording(true)
      setSeconds(0)
      timerRef.current = window.setInterval(() => {
        secondsRef.current += 1
        const next = secondsRef.current
        setSeconds(next)
        if (next >= MAX_VOICE_SECONDS) stopRecorder()
      }, 1000)
    } catch {
      cleanupStream()
      setError('Allow microphone access to send a voice note.')
    }
  }

  if (recording) {
    return (
      <div className="flex min-w-0 w-full basis-full items-center gap-2 rounded-2xl bg-[#FCF0DA] px-3 py-2">
        <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#E5484D]" />
        <p className="text-sm font-semibold tabular-nums text-[#8A5A00]">{formatMmSs(seconds)}</p>
        <button
          type="button"
          onClick={stopRecorder}
          className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#123524] px-3 py-1.5 text-xs font-semibold text-white"
        >
          <Square className="h-3 w-3 fill-current" />
          Stop
        </button>
        <button
          type="button"
          onClick={cancel}
          className="rounded-full p-1.5 text-[#8A5A00] hover:bg-white/70"
          aria-label="Cancel recording"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (variant === 'chip') {
    return (
      <div>
        <button
          type="button"
          disabled={busy || disabled || hasVoice || remaining <= 0}
          onClick={() => void start()}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#123524] ring-1 ring-[#D7E3C4] hover:bg-[#EDF3E0] disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
          Voice
        </button>
        {error ? <p className="mt-1.5 text-xs text-[#B42318]">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        disabled={busy || disabled || hasVoice || remaining <= 0}
        onClick={() => void start()}
        className="flex h-10 w-10 items-center justify-center rounded-full text-[#123524] hover:bg-[#EDF3E0] disabled:opacity-40"
        aria-label="Record voice note"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
      </button>
      {error ? <p className="mt-1 max-w-[10rem] text-[11px] text-[#B42318]">{error}</p> : null}
    </div>
  )
}
