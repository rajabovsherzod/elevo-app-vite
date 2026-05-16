import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart2Questions,
  evaluateListeningPart2,
  type ListeningPart2QuestionsResponse,
  type ListeningPart2EvaluateResponse,
} from "@/lib/api/listening"
import { parseError, type AppError } from "@/lib/types/errors"
import { useInvalidateQuota } from "@/hooks/auth/use-invalidate-quota"

export type ListeningPart2Phase =
  | "loading"
  | "instruction"
  | "question-audio"
  | "exam"
  | "submitting"
  | "result"
  | "error"

const LOAD_TIMEOUT_MS = 30_000
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1_500

const API_BASE = () =>
  (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function fetchPart2WithRetry(examId: number) {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart2Questions(examId)
    } catch (err) {
      lastErr = err
      if (i < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS)
    }
  }
  throw lastErr
}

function fixAudioUrl(raw: string | null): string {
  if (!raw) return ""
  try {
    return API_BASE() + new URL(raw).pathname
  } catch {
    return raw
  }
}

export function useListeningPart2(examId: number) {
  const invalidateQuota = useInvalidateQuota()
  const [phase, setPhase]           = useState<ListeningPart2Phase>("loading")
  const [data, setData]             = useState<ListeningPart2QuestionsResponse | null>(null)
  const [audioUrl, setAudioUrl]     = useState<string | null>(null)
  const [answers, setAnswers]       = useState<Record<string, string>>({})
  const [result, setResult]         = useState<ListeningPart2EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [error, setError]           = useState<AppError | null>(null)
  const [retryKey, setRetryKey]     = useState(0)

  const audioRef     = useRef<HTMLAudioElement | null>(null)
  const cancelledRef = useRef(false)
  const submittedRef = useRef(false)

  const stopAudio = useCallback(() => {
    const a = audioRef.current
    if (a) {
      a.onended = null
      a.onerror = null
      a.pause()
      a.currentTime = 0
      a.src = ""
      audioRef.current = null
    }
    setIsAudioPlaying(false)
  }, [])

  const playAudio = useCallback((src: string, onEnd?: () => void) => {
    stopAudio()
    const audio = new Audio(src)
    audioRef.current = audio
    setIsAudioPlaying(true)
    let done = false
    const finish = () => {
      if (done) return
      done = true
      audio.onended = null
      audio.onerror = null
      setIsAudioPlaying(false)
      if (!cancelledRef.current && !submittedRef.current) onEnd?.()
    }
    audio.onended = finish
    audio.onerror = finish
    audio.play().catch(() => finish())
  }, [stopAudio])

  useEffect(() => {
    cancelledRef.current = false
    submittedRef.current = false
    setPhase("loading")
    setData(null)
    setAudioUrl(null)
    setAnswers({})
    setResult(null)
    setError(null)

    const timeout = setTimeout(() => {
      if (!cancelledRef.current) {
        cancelledRef.current = true
        stopAudio()
        setError(parseError(new Error("So'rov juda uzoq davom etdi. Internet aloqasini tekshiring.")))
        setPhase("error")
      }
    }, LOAD_TIMEOUT_MS)

    ;(async () => {
      try {
        const response = await fetchPart2WithRetry(examId)
        if (cancelledRef.current) return

        clearTimeout(timeout)

        const url = fixAudioUrl(response.audio_url)
        setData(response)
        setAudioUrl(url || null)

        // Initialize answers
        const blank: Record<string, string> = {}
        response.positions.forEach(p => { blank[String(p)] = "" })
        setAnswers(blank)

        setPhase("instruction")

        playAudio("/sounds/listening-part2.mp3", () => {
          if (cancelledRef.current) return
          if (url) {
            setPhase("question-audio")
            playAudio(url, () => { 
              if (!cancelledRef.current) setPhase("exam") 
            })
          } else {
            setPhase("exam")
          }
        })
      } catch (err: any) {
        clearTimeout(timeout)
        if (cancelledRef.current) return
        setError(parseError(err))
        setPhase("error")
      }
    })()

    return () => {
      cancelledRef.current = true
      clearTimeout(timeout)
      stopAudio()
    }
  }, [examId, retryKey, stopAudio, playAudio])

  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  const setAnswer = useCallback((position: number, value: string) => {
    setAnswers(prev => ({ ...prev, [String(position)]: value }))
  }, [])

  const submit = useCallback(async () => {
    if (!data) return
    submittedRef.current = true
    stopAudio()
    setPhase("submitting")
    try {
      const [res] = await Promise.all([
        evaluateListeningPart2(data.exam_id, data.question_id, { answers }),
        sleep(2000),
      ])
      setResult(res)
      setPhase("result")
      invalidateQuota()
    } catch (err: any) {
      setError(parseError(err))
      setPhase("error")
    }
  }, [answers, data, stopAudio, invalidateQuota])

  const allFilled = useMemo(() =>
    data
      ? data.positions.every(p => (answers[String(p)] ?? "").trim().length > 0)
      : false,
    [data, answers]
  )

  const filledCount = useMemo(() =>
    data
      ? data.positions.filter(p => (answers[String(p)] ?? "").trim().length > 0).length
      : 0,
    [data, answers]
  )

  return {
    phase,
    data,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    error,
    allFilled,
    filledCount,
    setAnswer,
    submit,
    retry,
  }
}
