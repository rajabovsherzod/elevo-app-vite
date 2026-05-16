import { useNavigate } from "react-router"
import { Crown, Check, Sparkles } from "@/lib/icons"

interface PaywallScreenProps {
  skill: string
  skillDisplay: string
  message: string
}

const BENEFITS = [
  "Barcha qismlar va darslarga to'liq kirish",
  "Cheksiz mashq — istalgan vaqt, istalgancha",
  "Har bir javobga batafsil tahlil va izoh",
  "Progress kuzatuvi va batafsil statistika",
]

export function PaywallScreen({ skillDisplay, message }: PaywallScreenProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3 animate-fade-in">

      {/* ─── Premium card ─────────────────────────────── */}
      <div className="relative elevo-card elevo-card-border elevo-border-glow elevo-mesh overflow-hidden ring-1 ring-primary/30">

        {/* Large decorative corner icon */}
        <Sparkles
          className="absolute -top-5 -right-5 w-36 h-36 text-primary opacity-[0.07] pointer-events-none"
          aria-hidden
        />

        {/* ─── Hero block ──────────────────────────────── */}
        <div className="relative z-10 px-6 pt-7 pb-6 flex flex-col gap-5">

          {/* Top row: badge + icon */}
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/15 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                Premium
              </span>
            </span>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center elevo-glow"
              style={{
                background: "linear-gradient(135deg, var(--el-primary) 0%, var(--el-primary-dim) 100%)",
              }}
            >
              <Crown className="w-6 h-6 text-white" strokeWidth={2} aria-hidden />
            </div>
          </div>

          {/* Title + message */}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-on-surface tracking-tight leading-tight">
              {skillDisplay}
              <br />
              <span className="text-primary">Premium kirish</span>
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
              {message}
            </p>
          </div>
        </div>

        {/* ─── Divider ──────────────────────────────────── */}
        <div className="mx-6 h-px bg-outline-variant/60" />

        {/* ─── Benefits ─────────────────────────────────── */}
        <div className="relative z-10 px-6 pt-5 pb-6 flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant mb-1">
            Nima olasiz
          </p>

          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3">
              <div
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "color-mix(in srgb, var(--el-primary) 14%, transparent)" }}
              >
                <Check className="w-3 h-3 text-primary" strokeWidth={3.5} aria-hidden />
              </div>
              <span className="text-sm text-on-surface leading-snug">{benefit}</span>
            </div>
          ))}
        </div>

        {/* ─── CTA ──────────────────────────────────────── */}
        <div className="relative z-10 px-6 pb-6">
          <button
            onClick={() => navigate("/upgrade")}
            className="elevo-btn-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Crown className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
            <span>Premium rejalarni ko'rish</span>
          </button>
        </div>
      </div>

      {/* ─── Free quota note ──────────────────────────── */}
      <div className="elevo-card elevo-card-border px-5 py-4 flex items-center gap-3">
        <div
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--el-primary) 10%, transparent)" }}
        >
          <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} aria-hidden />
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Kuniga <span className="font-semibold text-on-surface">1 ta bepul mashq</span> mavjud.
          Ertaga qayta keling yoki Premium oling.
        </p>
      </div>

    </div>
  )
}
