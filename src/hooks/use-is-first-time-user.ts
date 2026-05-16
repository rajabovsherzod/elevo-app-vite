import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";

const STORAGE_KEY = "elevo-welcome-seen";

/**
 * Returns true for users who:
 *   1. Never dismissed the welcome card (no localStorage flag)
 *   2. Have status === "NEW" (fresh account, no trial/subscription yet)
 *
 * Defaults to seen=true so there's no flash of the card on non-NEW users.
 */
export function useIsFirstTimeUser() {
  const user = useAuthStore((s) => s.user);
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    setSeen(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const isFirstTime = !seen && user?.status === "NEW";

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setSeen(true);
  }, []);

  return { isFirstTime, dismiss };
}
