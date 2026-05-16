import { useSplashDone } from "@/providers/splash-provider";
import { useAuthStore } from "@/store/auth.store";

/**
 * Returns true when the app is visually ready AND user data is present.
 *
 * Gates:
 *   1. splashDone  — splash animation is fully gone
 *   2. user !== null — user object is in store (from cache or from /auth/telegram)
 *
 * Note: We check `user !== null` (not `_meLoaded`) because trial/quota fields
 * arrive with /auth/telegram, so data is ready the moment the user object exists.
 * _meLoaded becomes true at the same time as user is set, so both are equivalent
 * in practice — but this formulation is more semantically correct for the modal.
 */
export function useAppReady(): boolean {
  const splashDone = useSplashDone();
  const user       = useAuthStore((s) => s.user);
  return splashDone && user !== null;
}
