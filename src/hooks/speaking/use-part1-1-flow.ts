import { useState, useRef, useCallback, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { speakingService } from "@/services/speaking.service"
import { useMicRecorder } from "@/hooks/speaking/use-mic-recorder"
import { useAudioVisualizer } from "@/hooks/speaking/use-audio-visualizer"
import type { SpeakingPart1_1Response, SpeakingEvaluateResponse } from "@/schemas/speaking.schema"

const PREP_SECONDS = 5
const RECORD_SECONDS = 30
const MIN_AUDIO_BYTES = 1024

// sessionStorage key — survives remounts (Telegram WebView wake, HMR, etc.)
// but cleared on tab/session close. Per-exam so different attempts don't collide.
const RESULT_STORAGE_KEY = (examId: number) => `elevo:speaking:p1_1:result:${examId}`

type Phase =
  | { type: "intro" }
  | { type: "question"; index: 0 | 1 | 2; stage: "prep" | "beep" | "record"; timeLeft: number }
  | { type: "calculating" }
  | { type: "result"; data: SpeakingEvaluateResponse }
  | { type: "error"; message: string }

function loadStoredResult(examId: number): SpeakingEvaluateResponse | null {
  try {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY(examId))
    if (!raw) return null
    return JSON.parse(raw) as SpeakingEvaluateResponse
  } catch {
    return null
  }
}

function saveStoredResult(examId: number, data: SpeakingEvaluateResponse): void {
  try {
    sessionStorage.setItem(RESULT_STORAGE_KEY(examId), JSON.stringify(data))
  } catch { /* quota / disabled — ignore */ }
}

function clearStoredResult(examId: number): void {
  try { sessionStorage.removeItem(RESULT_STORAGE_KEY(examId)) }
  catch { /* ignore */ }
}

export function usePart1_1Flow(examId: number) {
  // Lazy init: restore result from sessionStorage if a prior session computed one
  // for this exam. This survives full page remounts (Telegram WebView reload,
  // window-focus refetch cascades, dev HMR) — the user keeps seeing the result
  // instead of being thrown back to the intro/questions.
  const [phase, setPhase] = useState<Phase>(() => {
    const stored = loadStoredResult(examId)
    return stored ? { type: "result", data: stored } : { type: "intro" }
  })
  const [streamReady, setStreamReady] = useState(false)

  const streamRef = useRef<MediaStream | null>(null)
  const micRequestedRef = useRef(false)
  // Index-based storage: audios[0], audios[1], audios[2]
  const audiosRef = useRef<(File | null)[]>([null, null, null])
  // Track which question is currently running (prevents double-start)
  const activeIndexRef = useRef<number>(-1)

  const { recordOnce, stopCurrent } = useMicRecorder()
  const visualizer = useAudioVisualizer()

  const { data: questionsData } = useQuery<SpeakingPart1_1Response>({
    queryKey: ["speaking-part1-1-questions", examId],
    queryFn: () => speakingService.getPart1_1Questions(examId),
    staleTime: 0,
  } as Parameters<typeof useQuery>[0])

  // Request mic ONCE when entering question phase
  useEffect(() => {
    if (phase.type !== "question") return
    if (micRequestedRef.current) return
    micRequestedRef.current = true

    let alive = true
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        if (!alive) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        setStreamReady(true)
      })
      .catch(() => {
        if (alive)
          setPhase({ type: "error", message: "Mikrofon ruxsati kerak. Brauzer sozlamalarida mikrofonni ruxsat eting." })
      })

    return () => { alive = false }
  }, [phase.type])

  // Release stream when leaving question phases
  useEffect(() => {
    if (phase.type === "intro" || phase.type === "question") return
    stopCurrent()
    visualizer.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setStreamReady(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.type])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrent()
      visualizer.destroy()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const evaluate = useMutation({
    mutationFn: (audios: File[]) => {
      const qd = questionsData!
      return speakingService.evaluatePart1_1({
        exam_id: qd.exam_id,
        part_ids: qd.questions.map(q => q.id),
        audios,
      })
    },
    onSuccess: (data) => {
      saveStoredResult(examId, data)
      setPhase({ type: "result", data })
    },
    onError: (error: unknown) => {
      let message = "Baholashda xatolik yuz berdi. Qayta urinib ko'ring."
      try {
        const resp = (error as { response?: { data?: Record<string, unknown> } }).response?.data
        if (resp && typeof resp === "object") {
          const pick = (v: unknown) =>
            typeof v === "string" ? v : Array.isArray(v) && typeof v[0] === "string" ? v[0] : null
          message =
            pick(resp.audio) ??
            pick(resp.transcript) ??
            pick(resp.detail) ??
            message
        }
      } catch { /* ignore */ }
      setPhase({ type: "error", message })
    },
  })

  // ── Per-question recording orchestration ─────────────────────────────────
  // Runs when stream is ready + we're in a question phase
  useEffect(() => {
    if (phase.type !== "question") return
    if (!streamReady || !streamRef.current) return

    const { index } = phase

    // Already running this question's recording
    if (activeIndexRef.current === index) return
    activeIndexRef.current = index

    const stream = streamRef.current
    let cancelled = false

    const run = async () => {
      // ── Prep countdown (5 seconds) ───────────────────────────────
      setPhase({ type: "question", index, stage: "prep", timeLeft: PREP_SECONDS })

      await countdown(PREP_SECONDS, (t) => {
        if (cancelled) return
        setPhase({ type: "question", index, stage: "prep", timeLeft: t })
      })
      if (cancelled) return

      // ── Beep ────────────────────────────────────────────────────
      setPhase({ type: "question", index, stage: "beep", timeLeft: 0 })
      await playBeep()
      if (cancelled) return

      // ── Record ──────────────────────────────────────────────────
      setPhase({ type: "question", index, stage: "record", timeLeft: RECORD_SECONDS })

      // cancelCountdown lets us abort the visual ticker when recording ends early
      let cancelCountdown: (() => void) | null = null
      const countdownPromise = countdown(RECORD_SECONDS, (t) => {
        if (cancelled) return
        setPhase({ type: "question", index, stage: "record", timeLeft: t })
      }, (cancel) => { cancelCountdown = cancel })

      // Start actual recording (resolves when done or maxSeconds reached)
      let file: File
      try {
        file = await recordOnce({ stream, maxSeconds: RECORD_SECONDS, questionIndex: index })
      } catch {
        cancelCountdown?.()
        if (!cancelled)
          setPhase({ type: "error", message: "Audio yozishda xatolik yuz berdi. Qayta urinib ko'ring." })
        return
      }
      if (cancelled) { cancelCountdown?.(); return }
      // Recording ended (normally or early) — stop the visual countdown
      cancelCountdown?.()

      // ── Store + advance ─────────────────────────────────────────
      const valid = file.size >= MIN_AUDIO_BYTES

      if (!valid) {
        setPhase({
          type: "error",
          message: `Savol ${index + 1} uchun audio yozilmadi. Mikrofon ishlayotganini tekshirib, qayta urinib ko'ring.`,
        })
        return
      }

      audiosRef.current[index] = file

      if (index < 2) {
        activeIndexRef.current = -1
        setPhase({ type: "question", index: (index + 1) as 0 | 1 | 2, stage: "prep", timeLeft: PREP_SECONDS })
      } else {
        const files = audiosRef.current as File[]
        setPhase({ type: "calculating" })
        evaluate.mutate(files)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.type, (phase as { index?: number }).index, streamReady])

  const handleIntroEnded = useCallback(() => {
    visualizer.unlock()
    setPhase({ type: "question", index: 0, stage: "prep", timeLeft: PREP_SECONDS })
  }, [visualizer])

  const handleEarlyStop = useCallback(() => {
    stopCurrent()
  }, [stopCurrent])

  // Called when user leaves the result page (back button or "Speaking bo'limiga qaytish"),
  // so the next visit starts fresh instead of restoring this stale result.
  const handleFinishResult = useCallback(() => {
    clearStoredResult(examId)
  }, [examId])

  const handleError = useCallback((message: string) => {
    setPhase({ type: "error", message })
  }, [])

  const handleRetry = useCallback(() => {
    clearStoredResult(examId)
    audiosRef.current = [null, null, null]
    activeIndexRef.current = -1
    micRequestedRef.current = false
    stopCurrent()
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setStreamReady(false)
    setPhase({ type: "intro" })
  }, [stopCurrent, examId])

  return {
    phase,
    stream: streamRef.current,
    streamReady,
    questions: questionsData?.questions ?? [],
    visualizer,
    handleIntroEnded,
    handleEarlyStop,
    handleError,
    handleRetry,
    handleFinishResult,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function countdown(
  seconds: number,
  onTick: (remaining: number) => void,
  onCancelRef?: (cancel: () => void) => void,
): Promise<void> {
  return new Promise(resolve => {
    let remaining = seconds
    let timer: ReturnType<typeof setTimeout> | null = null
    let done = false

    const cancel = () => {
      if (done) return
      done = true
      if (timer) clearTimeout(timer)
      resolve()
    }

    onCancelRef?.(cancel)

    const tick = () => {
      if (done) return
      remaining--
      onTick(remaining)
      if (remaining <= 0) { done = true; resolve(); return }
      timer = setTimeout(tick, 1000)
    }
    timer = setTimeout(tick, 1000)
  })
}

function playBeep(): Promise<void> {
  return new Promise(resolve => {
    try {
      const audio = new Audio("/speaking-sounds/time-over.mp3")
      audio.addEventListener("ended", () => resolve())
      audio.addEventListener("error", () => resolve())
      audio.play().catch(() => resolve())
      // Safety timeout
      setTimeout(resolve, 3000)
    } catch {
      resolve()
    }
  })
}
