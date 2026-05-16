

import { useState, useCallback, useRef, useEffect } from "react"
import { parseError, ErrorCode, type AppError } from "@/lib/types/errors"
import { useInvalidateQuota } from "@/hooks/auth/use-invalidate-quota"

export interface UseExamSubmitOptions<TPayload, TResult> {
  submitFn: (payload: TPayload) => Promise<TResult>
  onSuccess?: (result: TResult) => void
  onError?: (error: AppError) => void
}

export interface UseExamSubmitReturn<TPayload, TResult> {
  submitting: boolean
  result: TResult | null
  error: AppError | null
  submit: (payload: TPayload) => Promise<void>
  reset: () => void
}

/**
 * Shared exam submit hook
 * 
 * @example
 * const submitter = useExamSubmit({
 *   submitFn: (payload) => evaluateReadingPart1(payload),
 *   onSuccess: (result) => {
 *     setResult(result)
 *     timer.stop()
 *   }
 * })
 */
export function useExamSubmit<TPayload, TResult>({
  submitFn,
  onSuccess,
  onError,
}: UseExamSubmitOptions<TPayload, TResult>): UseExamSubmitReturn<TPayload, TResult> {
  const invalidateQuota = useInvalidateQuota()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<TResult | null>(null)
  const [error, setError] = useState<AppError | null>(null)
  const submittingRef = useRef(false)

  useEffect(() => {
    submittingRef.current = submitting
  }, [submitting])

  const submit = useCallback(async (payload: TPayload) => {
    if (submittingRef.current) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await submitFn(payload)
      setResult(response)
      setError(null)
      invalidateQuota()

      if (onSuccess) {
        onSuccess(response)
      }
    } catch (err) {
      const appError = parseError(err)
      // 402 Payment Required is handled globally by QuotaExhaustedModal — keep the form visible
      if (appError.code !== ErrorCode.PAYMENT_REQUIRED) {
        setError(appError)
      }
      if (onError) {
        onError(appError)
      }
    } finally {
      setSubmitting(false)
    }
  }, [submitFn, onSuccess, onError])

  const reset = useCallback(() => {
    setSubmitting(false)
    setResult(null)
    setError(null)
  }, [])

  return {
    submitting,
    result,
    error,
    submit,
    reset,
  }
}
