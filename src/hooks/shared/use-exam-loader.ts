import { useState, useCallback, useEffect, useRef } from "react"
import { parseError, type AppError } from "@/lib/types/errors"

const LOAD_TIMEOUT_MS = 30_000
const MAX_RETRIES = 3
const RETRY_DELAYS_MS = [1_500, 3_000, 6_000] // exponential back-off

export interface UseExamLoaderOptions<T> {
  loadFn: () => Promise<T>
  validateFn?: (data: T) => void
  onSuccess?: (data: T) => void
}

export interface UseExamLoaderReturn<T> {
  loading: boolean
  error: AppError | null
  data: T | null
  load: () => Promise<void>
  retry: () => void
}

export function useExamLoader<T>({
  loadFn,
  validateFn,
  onSuccess,
}: UseExamLoaderOptions<T>): UseExamLoaderReturn<T> {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  const [data, setData] = useState<T | null>(null)

  // Track latest abort controller so navigating away cancels the request
  const abortRef = useRef<AbortController | null>(null)

  // Cancel on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const load = useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    setData(null)

    let lastError: unknown

    const timeout = setTimeout(() => {
      controller.abort()
      setError(parseError({ code: 'ECONNABORTED' }))
      setLoading(false)
    }, LOAD_TIMEOUT_MS)

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (controller.signal.aborted) break

      try {
        const result = await loadFn()

        if (controller.signal.aborted) break

        clearTimeout(timeout)

        if (validateFn) {
          validateFn(result)
        }

        setData(result)
        setError(null)
        setLoading(false)

        if (onSuccess) {
          onSuccess(result)
        }

        return
      } catch (err) {
        if (controller.signal.aborted) break
        lastError = err
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
        }
      }
    }

    if (!controller.signal.aborted) {
      clearTimeout(timeout)
      setError(parseError(lastError))
      setLoading(false)
    }
  }, [loadFn, validateFn, onSuccess])

  const retry = useCallback(() => {
    load()
  }, [load])

  return {
    loading,
    error,
    data,
    load,
    retry,
  }
}
