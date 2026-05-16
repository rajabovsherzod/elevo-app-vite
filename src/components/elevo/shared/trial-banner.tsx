import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Zap, Clock, Lock } from "@/lib/icons"
import { useAuthStore } from "@/store/auth.store"

// ─── Trial banner helpers ──────────────────────────────────────────────────────

function DaysRing({ days, total = 3 }: { days: number; total?: number }) {
  const size   = 48
  const stroke = 4
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  const dash   = circ * Math.max(0, Math.min(days / total, 1))

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="currentColor" strokeWidth={stroke}
          className="text-primary/15"
        />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="currentColor" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className="text-primary"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black text-primary leading-none">{days}</span>
        <span className="text-[8px] font-bold text-on-surface-variant leading-none mt-0.5">kun</span>
      </div>
    </div>
  )
}

function TrialBannerSkeleton() {
  return (
    <div
      className="elevo-card elevo-card-border rounded-2xl overflow-hidden animate-pulse"
      style={{ height: 148 }}
    />
  )
}

// ─── Trial banner (trial_daily users) ─────────────────────────────────────────

function TrialBannerView() {
  const user = useAuthStore((s) => s.user)
  if (!user?.trial?.active) return null

  const daysLeft  = user.trial.days_left ?? 0
  const gq        = user.global_quota
  const remaining = gq?.remaining ?? 0
  const total     = gq?.total ?? 25
  const usedPct   = total > 0 ? (total - remaining) / total : 0

  return (
    <div className="elevo-card elevo-card-border rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
              <Zap className="w-4.5 h-4.5 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 leading-none mb-1">
                Bepul sinov davri
              </p>
              <p className="text-sm font-bold text-on-surface leading-none">
                {daysLeft === 0 ? "Bugun oxirgi kun" : `${daysLeft} kun qoldi`}
              </p>
            </div>
          </div>
          <DaysRing days={daysLeft} total={3} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Bugungi urinishlar</span>
            <span className="text-xs font-bold text-primary">{remaining}/{total}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-primary/10">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(1 - usedPct) * 100}%` }}
            />
          </div>
        </div>

        <Link
          to="/payment"
          className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-black text-primary bg-primary/10 border border-primary/15 active:scale-[0.98] transition-transform"
        >
          <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
          Premium — cheksiz foydalanish
        </Link>
      </div>
    </div>
  )
}

// ─── Free quota banner (free_daily regular users) ─────────────────────────────

function useCountdown(resetsAt: string | undefined) {
  const [label, setLabel] = useState("")

  useEffect(() => {
    if (!resetsAt) return

    function compute() {
      const diff = new Date(resetsAt!).getTime() - Date.now()
      if (diff <= 0) { setLabel("tez orada"); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      if (h > 0) setLabel(`${h} soat ${m} daqiqada`)
      else setLabel(`${m} daqiqada`)
    }

    compute()
    const id = setInterval(compute, 60_000)
    return () => clearInterval(id)
  }, [resetsAt])

  return label
}

function FreeQuotaBannerView() {
  const user = useAuthStore((s) => s.user)
  const gq   = user?.global_quota

  const resetLabel = useCountdown(gq?.remaining === 0 ? gq?.resets_at : undefined)

  if (!gq || gq.kind !== "free_daily") return null

  const remaining = gq.remaining
  const total     = gq.total ?? 1
  const exhausted = remaining === 0

  if (!exhausted) {
    // ── Quota mavjud: kichik, subtle info strip ──────────────────────────────
    return (
      <div className="elevo-card elevo-card-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 leading-none mb-0.5">
                Bugungi bepul slot
              </p>
              <p className="text-xs font-bold text-on-surface leading-none">
                {remaining} / {total} urinish qoldi
              </p>
            </div>
          </div>

          {/* Mini progress dots */}
          <div className="flex items-center gap-1 shrink-0">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  background: i < remaining ? "var(--el-primary, #6366f1)" : "rgba(99,102,241,0.15)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Quota tugadi: kattaroq, countdown + upgrade CTA ───────────────────────
  return (
    <div className="elevo-card elevo-card-border rounded-2xl overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-on-surface/[0.06] border border-on-surface/10 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-on-surface-variant" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 leading-none mb-1">
              Bugungi limit
            </p>
            <p className="text-sm font-bold text-on-surface leading-none">
              Bepul urinishlar tugadi
            </p>
          </div>
        </div>

        {/* Progress bar — fully used */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Bugungi urinishlar</span>
            <span className="text-xs font-bold text-on-surface-variant">0 / {total}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-on-surface/[0.06]">
            <div className="h-full w-0 bg-on-surface/20 rounded-full" />
          </div>
        </div>

        {/* Reset countdown */}
        {resetLabel && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-on-surface/[0.04] border border-on-surface/[0.06]">
            <Clock className="w-3.5 h-3.5 text-on-surface-variant shrink-0" strokeWidth={2} />
            <p className="text-xs text-on-surface-variant">
              Yangilanadi: <span className="font-bold text-on-surface">{resetLabel}</span>
            </p>
          </div>
        )}

        {/* CTA */}
        <Link
          to="/payment"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-black text-primary bg-primary/10 border border-primary/15 active:scale-[0.98] transition-transform"
        >
          <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
          Premium — cheksiz foydalanish
        </Link>
      </div>
    </div>
  )
}

// ─── Public export ─────────────────────────────────────────────────────────────

export function TrialBanner() {
  const user = useAuthStore((s) => s.user)

  // Render directly from cached user — no _meLoaded gate needed.
  // On warm start user is immediately available; on cold start skeleton shows
  // only while user is null (before /auth/telegram resolves).
  // Background /auth/me refresh updates store → smooth re-render, no pop-in.
  if (!user) return <TrialBannerSkeleton />

  if (user.trial?.active)                       return <TrialBannerView />
  if (user.global_quota?.kind === "free_daily") return <FreeQuotaBannerView />
  return null
}
