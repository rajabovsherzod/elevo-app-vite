import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart3Questions,
  evaluateListeningPart3,
  type ListeningPart3QuestionsResponse,
  type ListeningPart3EvaluateResponse,
} from "@/lib/api/listening"
import { parseError, type AppError } from "@/lib/types/errors"
import { useInvalidateQuota } from "@/hooks/auth/use-invalidate-quota"

export type ListeningPart3Phase =
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

async function fetchPart3WithRetry(examId: number) {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart3Questions(examId)
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

export function useListeningPart3(examId: number) {
  const invalidateQuota = useInvalidateQuota()
  const [phase, setPhase]           = useState<ListeningPart3Phase>("loading")
  const [data, setData]             = useState<ListeningPart3QuestionsResponse | null>(null)
  const [audioUrl, setAudioUrl]     = useState<string | null>(null)
  const [answers, setAnswers]       = useState<Record<string, string>>({})  // {"1": "A", "2": "C", ...}
  const [result, setResult]         = useState<ListeningPart3EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [error, setError]           = useState<AppError | null>(null)
  const [retryKey, setRetryKey]     = useState(0)

  const audioRef     = useRef<HTMLAudioElement | null>(null)
  const cancelledRef = useRef(false)
  const submittedRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    submittedRef.current = false
    setPhase("loading")
    setData(null)
    setAudioUrl(null)
    setAnswers({})
    setResult(null)
    setError(null)

    const stopAudio = () => {
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
    }

    const playAudio = (src: string, onEnd?: () => void) => {
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
    }

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
        const response = await fetchPart3WithRetry(examId)
        if (cancelledRef.current) return

        clearTimeout(timeout)

        const url = fixAudioUrl(response.audio_url)
        setData(response)
        setAudioUrl(url || null)

        // Initialize answers (5 speakers)
        const blank: Record<string, string> = {}
        response.speakers.forEach(s => { blank[String(s.position)] = "" })
        setAnswers(blank)

        setPhase("instruction")

        // Play instruction audio - this will run every time data is loaded
        playAudio("/sounds/listening-part3.mp3", () => {
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
  }, [examId, retryKey])

  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  const selectAnswer = useCallback((position: number, letter: string) => {
    setAnswers(prev => ({ ...prev, [String(position)]: letter }))
  }, [])

  const submit = useCallback(async () => {
    if (!data) return
    submittedRef.current = true
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
    setPhase("submitting")
    try {
      const [res] = await Promise.all([
        evaluateListeningPart3(data.exam_id, data.question_id, { answers }),
        sleep(2000),
      ])
      setResult(res)
      setPhase("result")
      invalidateQuota()
    } catch (err: any) {
      setError(parseError(err))
      setPhase("error")
    }
  }, [answers, data, invalidateQuota])

  const allFilled = useMemo(() =>
    data
      ? data.speakers.every(s => (answers[String(s.position)] ?? "").trim().length > 0)
      : false,
    [data, answers]
  )

  const filledCount = useMemo(() =>
    data
      ? data.speakers.filter(s => (answers[String(s.position)] ?? "").trim().length > 0).length
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
    selectAnswer,
    submit,
    retry,
  }
}
