import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuthStore } from "@/store/auth.store";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { SplashScreen } from "@/components/elevo/splash/splash-screen";
import { prefetchPages } from "@/utils/prefetch-pages";

// ── Public types ──────────────────────────────────────────────────
export type BootPhase =
  | "BOOT"           // waiting for Telegram initData
  | "AUTHENTICATING" // /auth/telegram in-flight
  | "HYDRATING"      // /auth/me in-flight
  | "READY"          // all data settled
  | "ERROR";         // auth failed or timeout

// ── Timings ───────────────────────────────────────────────────────
// Letter-by-letter animation ends at ~1505ms (see splash-screen.tsx constants).
// 2000ms = animation (~1500ms) + 500ms "settled" reading time.
// EXIT_MS must match the splash-exit CSS animation duration in globals.css.
const SPLASH_MIN_MS = 2000;
const SPLASH_MAX_MS = 6000;
const EXIT_MS       = 420;   // smooth fade-out duration

// ── Warm-start detection ──────────────────────────────────────────
// If the user already has a cached session, skip the splash entirely.
// Returning users (app reload / Telegram WebView wake) should see
// their content immediately — the brand animation is for first boot only.
const _warmStart = (() => {
  try {
    const raw = localStorage.getItem("elevo-auth");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!(parsed?.state?.user && parsed?.state?.isAuthenticated);
  } catch {
    return false;
  }
})();

// ── Context (used by useAppReady) ─────────────────────────────────
const SplashDoneContext = createContext(false);
export function useSplashDone() {
  return useContext(SplashDoneContext);
}

// ── BootError screen ─────────────────────────────────────────────
function BootErrorScreen() {
  const PRIMARY = "#4F46E5";
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6">
      <div
        style={{
          width: 72, height: 72, borderRadius: 20,
          background: "rgba(79,70,229,0.10)",
          border: "1.5px solid rgba(79,70,229,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 28,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <path opacity="0.5"
            d="M6.87054 26.7399C7.92168 29.0424 11.1761 29.0886 12.2922 26.8169L18.676 13.8228C19.6553 11.8294 18.2044 9.5 15.9834 9.5L3.66755 9.5C1.48356 9.5 0.0314944 11.7591 0.938489 13.7459L6.87054 26.7399Z"
            fill={PRIMARY}
          />
          <path
            d="M35.8177 36.8043C35.3172 37.8411 34.2674 38.5 33.1161 38.5H16.8085C14.5892 38.5 13.1382 36.1739 14.1141 34.1807L25.3765 11.1807C25.8802 10.1521 26.9256 9.5 28.0709 9.5L44.2195 9.5C46.4315 9.5 47.8828 11.8122 46.9212 13.8042L35.8177 36.8043Z"
            fill={PRIMARY}
          />
        </svg>
      </div>
      <h1
        className="text-on-surface text-center"
        style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}
      >
        Ulanishda muammo
      </h1>
      <p
        className="text-on-surface-variant text-center"
        style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 280, marginBottom: 28 }}
      >
        Telegram orqali ulanib bo&apos;lmadi. Internet aloqangizni tekshirib, qayta urinib ko&apos;ring.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: PRIMARY, color: "#fff",
          border: "none", borderRadius: 12,
          padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}
      >
        Qayta urinish
      </button>
    </div>
  );
}

// ── Provider ─────────────────────────────────────────────────────
export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [minPassed,     setMinPassed]     = useState(_warmStart);
  const [timedOut,      setTimedOut]      = useState(false);
  const [splashMounted, setSplashMounted] = useState(!_warmStart);
  const [exiting,       setExiting]       = useState(false);
  const [contentVisible,setContentVisible]= useState(_warmStart);
  const [splashDone,    setSplashDone]    = useState(_warmStart);

  // ── Eager /auth/me fetch ──────────────────────────────────────
  // This MUST be called at top level so fresh user data (including
  // global_quota, trial.is_first_session) arrives BEFORE splash exits.
  // Without this, /me only fires when user navigates to profile page,
  // causing global_quota banner + WelcomeTrialModal to "pop in" late.
  useCurrentUser();

  // Zustand store reads (session-only fields)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const _bootStatus     = useAuthStore((s) => s._bootStatus);
  const _meLoaded       = useAuthStore((s) => s._meLoaded);

  // Min timer — ensures brand animation plays fully
  useEffect(() => {
    const t = setTimeout(() => setMinPassed(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  // Max timer — safety net for no network / no initData
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), SPLASH_MAX_MS);
    return () => clearTimeout(t);
  }, []);

  // ── Data readiness ────────────────────────────────────────────
  // ALWAYS wait for /me to settle — both warm and cold start.
  // The 2.6s splash minimum easily covers /me round-trip (~200-500ms),
  // so users never see late-arriving data after splash exit.
  const dataReady =
    (isAuthenticated && _meLoaded) ||  // /me settled (success OR error)
    _bootStatus === "error"        ||  // auth failed
    timedOut;                          // safety timeout

  const isReady = (minPassed && dataReady) || timedOut;

  // ── Derive phase for splash screen ────────────────────────────
  let phase: BootPhase = "BOOT";
  if (timedOut && !isAuthenticated) {
    phase = "ERROR";
  } else if (_bootStatus === "error") {
    phase = "ERROR";
  } else if (isAuthenticated && _meLoaded) {
    phase = "READY";
  } else if (isAuthenticated && !_meLoaded) {
    phase = "HYDRATING";
  } else if (_bootStatus === "pending") {
    phase = "AUTHENTICATING";
  }

  // ── Exit logic ─────────────────────────────────────────────────
  const exitTriggered = useRef(false);

  useEffect(() => {
    if (!isReady || exitTriggered.current) return;
    exitTriggered.current = true;

    // Content fades in slightly after exit starts (feels more layered)
    setExiting(true);
    setTimeout(() => setContentVisible(true), 80);

    const t = setTimeout(() => {
      setSplashMounted(false);
      setSplashDone(true);
      // Splash is gone, user is on home screen — prefetch all lazy chunks now
      prefetchPages();
    }, EXIT_MS);

    return () => clearTimeout(t);
  }, [isReady]);

  return (
    <SplashDoneContext.Provider value={splashDone}>
      {/* Content — hidden while splash is up, fades in as splash exits */}
      <div
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: contentVisible ? "opacity 360ms ease-out" : "none",
          pointerEvents: contentVisible ? "auto" : "none",
        }}
      >
        {children}
      </div>

      {/* Splash gate */}
      {splashMounted && (
        timedOut && phase === "ERROR" ? (
          <BootErrorScreen />
        ) : (
          <SplashScreen phase={phase} exiting={exiting} />
        )
      )}
    </SplashDoneContext.Provider>
  );
}
