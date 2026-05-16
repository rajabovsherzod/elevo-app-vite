import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearTokens, setTokens } from "@/lib/api/client";
import type { AuthUser, TelegramAuthResponse } from "@/types/auth.types";

export type BootStatus = "idle" | "pending" | "done" | "error";

// Synchronous warm-start check: if cached user exists, data is already available.
const _hasCachedUser = (() => {
  try {
    const raw = localStorage.getItem("elevo-auth");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed?.state?.user;
  } catch {
    return false;
  }
})();

interface AuthState {
  // ── Persisted ────────────────────────────────────────────────────
  user: AuthUser | null;
  isAuthenticated: boolean;

  // ── Session-only (not persisted) ─────────────────────────────────
  /**
   * True once /auth/me has resolved (success or failure) OR cached user exists.
   * Used by TrialBanner, WelcomeTrialModal, useAppReady.
   */
  authResolved: boolean;
  /** Telegram auth mutation status — drives SplashProvider boot gate */
  _bootStatus: BootStatus;
  /** True once /auth/me has settled this session (used by splash boot gate) */
  _meLoaded: boolean;

  // ── Actions ──────────────────────────────────────────────────────
  setAuth: (response: TelegramAuthResponse) => void;
  setUser: (user: AuthUser) => void;
  setAuthResolved: () => void;
  setBootStatus: (status: BootStatus) => void;
  setMeLoaded: (loaded: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authResolved: _hasCachedUser,
      _bootStatus: "idle",
      // Warm start: cached user exists → /me data already present, no need to gate UI
      _meLoaded: _hasCachedUser,

      setAuth: (response) => {
        setTokens(response.access, response.refresh);
        set({
          user: response.user,
          isAuthenticated: true,
          authResolved: true,
          _bootStatus: "done",
          // Mark as loaded immediately — if backend returns skills/trial/global_quota
          // in /auth/telegram, splash exits without waiting for a second /auth/me.
          // If those fields are absent, /auth/me background refresh fills them in smoothly.
          _meLoaded: true,
        });
      },

      setUser: (user) => set({ user }),

      setAuthResolved: () => set({ authResolved: true }),

      setBootStatus: (status) => set({ _bootStatus: status }),

      setMeLoaded: (loaded) => set({ _meLoaded: loaded }),

      logout: () => {
        clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          authResolved: true,
          _bootStatus: "idle",
          _meLoaded: false,
        });
      },
    }),
    {
      name: "elevo-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // authResolved, _bootStatus, _meLoaded intentionally NOT persisted
      }),
    }
  )
);
