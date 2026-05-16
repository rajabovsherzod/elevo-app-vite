import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useInvalidateQuota } from "@/hooks/auth/use-invalidate-quota"
import {
  getReadingMockQuestion,
  evaluateReadingMock,
  type ReadingMockQuestionResponse,
  type ReadingMockEvaluateResponse,
} from "@/lib/api/reading"
import { useExamTimer, useExamLoader } from "@/hooks/shared"
import { parseError, ErrorCode, type AppError } from "@/lib/types/errors"

const TIMER_DURATION = 60 * 60 // 60 minutes
const DEFAULT_EXAM_ID = parseInt(import.meta.env.VITE_DEFAULT_EXAM_ID || "1")

export type MockPart = 1 | 2 | 3 | 4 | 5

export function useReadingMock() {
  const invalidateQuota = useInvalidateQuota()
  // ── Core state ──────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<AppError | null>(null)
  const [examData, setExamData] = useState<ReadingMockQuestionResponse | null>(null)
  const [result, setResult] = useState<ReadingMockEvaluateResponse | null>(null)
  const [currentPart, setCurrentPart] = useState<MockPart>(1)

  // ── Global answers (positions 1-35) ────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Refs for stable access in callbacks
  const examDataRef = useRef(examData)
  const answersRef = useRef(answers)

  useEffect(() => { examDataRef.current = examData }, [examData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ── Stable load function ────────────────────────────────────────────────────
  const loadFn = useCallback(() => getReadingMockQuestion(DEFAULT_EXAM_ID), [])

  // ── Loader (AbortController + exponential back-off built-in) ───────────────
  const loader = useExamLoader({
    loadFn,
    onSuccess: (data) => {
      setExamData(data)
      const initialAnswers: Record<string, string> = {}
      for (let i = 1; i <= 35; i++) {
        initialAnswers[i.toString()] = ""
      }
      setAnswers(initialAnswers)
      timer.reset()
    },
  })

  // ── Timer ───────────────────────────────────────────────────────────────────
  const timer = useExamTimer({
    duration: TIMER_DURATION,
    onTimeout: () => handleSubmit(),
    enabled: !loader.loading && !result && !loader.error && !submitting,
  })

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    loader.load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── User-friendly error: loader error + submit error, with mock-specific message ─
  const error = useMemo((): AppError | null => {
    const raw = loader.error || submitError
    if (!raw) return null
    if (
      raw.code === ErrorCode.NOT_FOUND &&
      typeof raw.message === "string" &&
      raw.message.toLowerCase().includes("not enough parts")
    ) {
      return {
        ...raw,
        message:
          "Full mock exam hali to'liq tayyorlanmagan. " +
          "Iltimos, oddiy partlardan boshlang yoki keyinroq urinib ko'ring.",
        retry: false,
      }
    }
    return raw
  }, [loader.error, submitError])

  // ── Answer handlers (global positions 1-35) ─────────────────────────────────
  const handleAnswerChange = useCallback((globalPosition: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [globalPosition.toString()]: value }))
  }, [])

  // ── Part-specific handlers (convert to global positions) ───────────────────
  // Part 1: positions 1-6
  const handlePart1Change = useCallback((position: number, value: string) => {
    handleAnswerChange(position, value)
  }, [handleAnswerChange])

  // Part 2: positions 7-14 (passage position -> letter)
  const handlePart2Select = useCallback((passagePosition: number, letter: string) => {
    handleAnswerChange(6 + passagePosition, letter)
  }, [handleAnswerChange])

  // Part 3: positions 15-20 (paragraph position -> letter)
  const handlePart3Select = useCallback((paragraphPosition: number, letter: string) => {
    handleAnswerChange(14 + paragraphPosition, letter)
  }, [handleAnswerChange])

  // Part 4: positions 21-29 (question position -> letter)
  const handlePart4Select = useCallback((questionPosition: number, letter: string) => {
    handleAnswerChange(20 + questionPosition, letter)
  }, [handleAnswerChange])

  // Part 5 gap filling: positions 30-33 (gap position -> text)
  const handlePart5GapChange = useCallback((gapPosition: number, value: string) => {
    handleAnswerChange(29 + gapPosition, value)
  }, [handleAnswerChange])

  // Part 5 MCQ: positions 34-35 (question position -> letter)
  const handlePart5McqSelect = useCallback((questionPosition: number, letter: string) => {
    const data = examDataRef.current
    if (!data) return
    const gapCount = data.part5.gap_positions.length  // 4
    const localMcqPosition = questionPosition - gapCount  // 5-4=1, 6-4=2
    handleAnswerChange(29 + gapCount + localMcqPosition, letter)
  }, [handleAnswerChange])

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goToNextPart = useCallback(() => {
    setCurrentPart((prev) => Math.min(prev + 1, 5) as MockPart)
  }, [])

  const goToPrevPart = useCallback(() => {
    setCurrentPart((prev) => Math.max(prev - 1, 1) as MockPart)
  }, [])

  const goToPart = useCallback((part: MockPart) => {
    setCurrentPart(part)
  }, [])

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const data = examDataRef.current
    const currentAnswers = answersRef.current
    if (!data || submitting) return

    setSubmitting(true)
    timer.stop()

    try {
      const res = await evaluateReadingMock(DEFAULT_EXAM_ID, {
        resource_ids: data.resource_ids,
        answers: currentAnswers,
      })
      setResult(res)
      invalidateQuota()
    } catch (err) {
      setSubmitError(parseError(err))
    } finally {
      setSubmitting(false)
    }
  }, [submitting, timer]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Retry ───────────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    setResult(null)
    setSubmitError(null)
    setCurrentPart(1)
    setAnswers({})
    setExamData(null)
    loader.retry()
  }, [loader])

  // ── Computed ────────────────────────────────────────────────────────────────
  const part1Filled = [1, 2, 3, 4, 5, 6].every(pos => answers[pos.toString()]?.trim().length > 0)
  const part2Filled = [7, 8, 9, 10, 11, 12, 13, 14].every(pos => answers[pos.toString()]?.trim().length > 0)
  const part3Filled = [15, 16, 17, 18, 19, 20].every(pos => answers[pos.toString()]?.trim().length > 0)
  const part4Filled = [21, 22, 23, 24, 25, 26, 27, 28, 29].every(pos => answers[pos.toString()]?.trim().length > 0)
  const part5Filled = [30, 31, 32, 33, 34, 35].every(pos => answers[pos.toString()]?.trim().length > 0)

  const partCompletions = { 1: part1Filled, 2: part2Filled, 3: part3Filled, 4: part4Filled, 5: part5Filled }
  const allFilled = part1Filled && part2Filled && part3Filled && part4Filled && part5Filled
  const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length

  // ── Convert global answers → part-specific format for UI ───────────────────
  const part1Answers: Record<number, string> = {}
  for (let i = 1; i <= 6; i++) part1Answers[i] = answers[i.toString()] || ""

  const part2Matches: Record<number, string> = {}
  for (let i = 1; i <= 8; i++) {
    const letter = answers[(6 + i).toString()] || ""
    if (letter) part2Matches[i] = letter
  }

  const part3Matches: Record<number, string> = {}
  for (let i = 1; i <= 6; i++) {
    const letter = answers[(14 + i).toString()] || ""
    if (letter) part3Matches[i] = letter
  }

  const part4Answers: Record<number, string> = {}
  for (let i = 1; i <= 9; i++) part4Answers[i] = answers[(20 + i).toString()] || ""

  const part5GapAnswers: Record<number, string> = {}
  for (let i = 1; i <= 4; i++) part5GapAnswers[i] = answers[(29 + i).toString()] || ""

  const part5McqAnswers: Record<number, string> = {}
  const gapCount = examData?.part5.gap_positions.length || 4
  for (let i = 1; i <= 2; i++) {
    const mcqPosition = gapCount + i  // 5, 6 (backend position)
    part5McqAnswers[mcqPosition] = answers[(29 + gapCount + i).toString()] || ""
  }

  return {
    // State
    loading: loader.loading,
    submitting,
    error,
    examData,
    result,
    currentPart,

    // Answers (part-specific format for UI compatibility)
    part1Answers,
    part2Matches,
    part3Matches,
    part4Answers,
    part5GapAnswers,
    part5McqAnswers,

    // Handlers
    handlePart1Change,
    handlePart2Select,
    handlePart3Select,
    handlePart4Select,
    handlePart5GapChange,
    handlePart5McqSelect,

    // Navigation
    goToNextPart,
    goToPrevPart,
    goToPart,

    // Submit & Retry
    handleSubmit,
    retry,

    // Computed
    partCompletions,
    allFilled,
    answeredCount,
    totalQuestionsCount: 35,

    // Timer
    timeLeft: timer.timeLeft,
    formatTime: timer.formatTime,
  }
}
