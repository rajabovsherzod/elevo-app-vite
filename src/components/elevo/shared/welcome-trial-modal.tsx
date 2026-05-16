import { useEffect, useRef, useState } from "react"
import { BookOpen, Headphones, Mic, PenLine, Zap, CheckCircle2 } from "@/lib/icons"
import { useAuthStore } from "@/store/auth.store"
import { useAppReady } from "@/hooks/auth/use-app-ready"
import { authService } from "@/services/auth.service"

const STORAGE_KEY = "elevo_welcomed_v1"
const CONFETTI_COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#3f51b5",
  "#2196f3", "#00bcd4", "#4caf50", "#ffeb3b",
  "#ff9800", "#ff5722",
]

const SKILLS = [
  { icon: BookOpen,   label: "Reading" },
  { icon: Headphones, label: "Listening" },
  { icon: PenLine,    label: "Writing" },
  { icon: Mic,        label: "Speaking" },
]

async function fireConfetti() {
  const { default: confetti } = await import("canvas-confetti")
  const d = { ticks: 90, zIndex: 9999, colors: CONFETTI_COLORS }
  confetti({ ...d, particleCount: 80, spread: 70, origin: { x: 0.15, y: 0.65 }, startVelocity: 38 })
  confetti({ ...d, particleCount: 80, spread: 70, origin: { x: 0.85, y: 0.65 }, startVelocity: 38 })
  setTimeout(() => {
    confetti({ ...d, particleCount: 65, spread: 120, origin: { x: 0.5, y: 0.55 }, startVelocity: 30 })
  }, 200)
  setTimeout(() => {
    confetti({ ...d, particleCount: 45, spread: 80, origin: { x: 0.3, y: 0.72 }, startVelocity: 28 })
    confetti({ ...d, particleCount: 45, spread: 80, origin: { x: 0.7, y: 0.72 }, startVelocity: 28 })
  }, 420)
}

function playSuccess() {
  try {
    const audio = new Audio("/sounds/effects/success.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch {}
}

export function WelcomeTrialModal() {
  const user    = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const ready   = useAppReady()

  const [visible, setVisible] = useState(false)
  const [animIn, setAnimIn]   = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    if (!ready || !user) return
    if (!user.trial?.active) return
    if (firedRef.current) return

    // ── Guard 1: localStorage (primary — has THIS device seen the modal?) ──
    const key = `${STORAGE_KEY}_${user.id}`
    if (localStorage.getItem(key)) return

    // ── Guard 2: backend is_first_session (secondary — new device, no localStorage) ──
    // Only block if backend explicitly says "not first session".
    // undefined = we don't know yet → show the modal (localStorage is the real gate).
    if (user.trial.is_first_session === false) return

    firedRef.current = true

    // 40ms settle — splash overlay fully gone, first paint complete.
    const t = setTimeout(() => {
      setVisible(true)
      playSuccess()

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimIn(true)
          setTimeout(fireConfetti, 200)
        })
      })
    }, 40)

    return () => clearTimeout(t)
  }, [ready, user])

  if (!visible || !user) return null

  // ── Dynamic values from store (no hardcoding) ───────────────────────────
  const daysLeft    = user.trial?.days_left   ?? 3
  const dailyTotal  = user.global_quota?.total    ?? 25
  const dailyLeft   = user.global_quota?.remaining ?? dailyTotal

  function close() {
    // 1. localStorage — instant, offline-safe
    localStorage.setItem(`${STORAGE_KEY}_${user!.id}`, "1")

    // 2. Optimistic store update — prevents re-trigger this session
    if (user!.trial) {
      setUser({ ...user!, trial: { ...user!.trial, is_first_session: false } })
    }

    // 3. Server-side — fire-and-forget, survives device change
    authService.welcomed().catch(() => {})

    setAnimIn(false)
    setTimeout(() => setVisible(false), 320)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end"
      style={{
        background:     animIn ? "rgba(0,0,0,0.50)"   : "rgba(0,0,0,0)",
        backdropFilter: animIn ? "blur(6px)"           : "blur(0px)",
        transition: "background 320ms ease, backdrop-filter 320ms ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div
        className="w-full"
        style={{
          transform:  animIn ? "translateY(0)"    : "translateY(100%)",
          transition: animIn
            ? "transform 420ms cubic-bezier(0.34,1.46,0.64,1)"
            : "transform 300ms cubic-bezier(0.4,0,1,1)",
        }}
      >
        <div
          className="w-full rounded-t-3xl overflow-hidden"
          style={{
            background: "var(--el-surface, #fff)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-on-surface/15" />
          </div>

          <div className="p-6 pt-4 flex flex-col gap-5 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">

            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                  Xush kelibsiz
                </p>
                <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
                  {daysLeft} kunlik bepul sinov
                </h2>
                <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                  Siz{" "}
                  <span className="font-bold text-on-surface">{daysLeft} kun</span>{" "}
                  davomida{" "}
                  <span className="font-bold text-primary">kuniga {dailyTotal} ta</span>{" "}
                  examni bepul bajara olasiz.
                </p>
              </div>
            </div>

            {/* Quota meter — shows today's remaining */}
            <div
              className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
              style={{ background: "color-mix(in srgb, var(--el-primary) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--el-primary) 16%, transparent)" }}
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Bugungi quota
                </p>
                <p className="text-sm font-bold text-on-surface">
                  {dailyLeft} / {dailyTotal} ta exam qoldi
                </p>
              </div>
              {/* Mini progress dots */}
              <div className="flex gap-1 flex-wrap justify-end" style={{ maxWidth: 100 }}>
                {Array.from({ length: Math.min(dailyTotal, 10) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: i < Math.round((dailyLeft / dailyTotal) * Math.min(dailyTotal, 10))
                        ? "var(--el-primary)"
                        : "color-mix(in srgb, var(--el-primary) 20%, transparent)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Skill chips */}
            <div className="grid grid-cols-2 gap-2.5">
              {SKILLS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-on-surface/[0.04] border border-on-surface/10"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
                  <span className="text-sm font-bold text-on-surface">{label}</span>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-2.5">
              {[
                "Istalgan skillni oching",
                "Part tanlang va examni boshlang",
                "Natijani AI bilan baholang",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
                  <span className="text-sm text-on-surface-variant">{step}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={close}
              className="w-full py-4 rounded-xl font-black text-sm text-white bg-primary active:scale-[0.98] transition-transform"
            >
              Boshlash — {daysLeft} kun bepul
            </button>

            <p className="text-[11px] text-center text-on-surface-variant -mt-1">
              Trial tugagach kuniga 1 ta bepul yoki premium olib oling
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
