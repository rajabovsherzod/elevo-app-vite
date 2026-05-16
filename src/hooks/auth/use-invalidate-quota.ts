import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { CURRENT_USER_KEY } from "./use-current-user"

/**
 * Returns a stable function that invalidates the auth/me query.
 * Call it after any exam submission so the quota badge updates immediately
 * instead of waiting for the next window focus or navigation.
 */
export function useInvalidateQuota() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY })
  }, [queryClient])
}
