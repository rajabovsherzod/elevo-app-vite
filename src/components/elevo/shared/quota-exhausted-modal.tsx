import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Crown, Zap, Clock, X } from "@/lib/icons"
import { register402Handler } from "@/lib/api/client"

interface QuotaState {
  visible: boolean;
  code: string;
  skill: string;
  skill_display: string;
  message: string;
  upgrade_url: string;
}

const INITIAL: QuotaState = {
  visible: false, code: '', skill: '', skill_display: '', message: '', upgrade_url: '/upgrade',
}

export function QuotaExhaustedModal() {
  const [state, setState] = useState<QuotaState>(INITIAL)
  const navigate = useNavigate()

  useEffect(() => {
    register402Handler((data) => {
      setState({ visible: true, ...data })
    })
  }, [])

  if (!state.visible) return null

  const close = () => setState(INITIAL)

  // Matn va icon reason_code ga qarab
  const isTrial = state.code === 'trial_daily_exhausted'
  const isSkillQuota = state.code === 'skill_quota_exhausted'

  const config = isTrial
    ? {
        icon: Zap,
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.10)",
        title: "Trial quotasi tugadi",
        cta: null,
        ctaLabel: null,
      }
    : isSkillQuota
    ? {
        icon: Crown,
        color: "#6366f1",
        bg: "rgba(99,102,241,0.10)",
        title: `${state.skill_display} quota tugadi`,
        cta: state.upgrade_url,
        ctaLabel: "Premiumni yangilash",
      }
    : {
        icon: Clock,
        color: "#8b5cf6",
        bg: "rgba(139,92,246,0.10)",
        title: "Bugungi limit tugadi",
        cta: state.upgrade_url,
        ctaLabel: "Premium sotib olish",
      }

  const Icon = config.icon

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(6px)" }}
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-t-3xl p-6 pb-8 flex flex-col gap-4"
        style={{ background: "var(--el-surface, #fff)", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle + close */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-1 rounded-full bg-outline-variant mx-auto" />
          <button onClick={close} className="absolute right-5 top-5 p-1 rounded-lg text-on-surface-variant">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: config.bg, border: `1.5px solid ${config.color}30` }}
          >
            <Icon className="w-8 h-8" style={{ color: config.color }} strokeWidth={1.75} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center flex flex-col gap-1.5">
          <h2 className="text-lg font-black text-on-surface">{config.title}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">{state.message}</p>
        </div>

        {/* CTA yoki yopish */}
        <div className="flex flex-col gap-2.5 mt-1">
          {config.cta && config.ctaLabel && (
            <button
              onClick={() => { close(); navigate(config.cta!) }}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              style={{ background: config.color, color: "#fff" }}
            >
              <Crown className="w-4 h-4" aria-hidden />
              {config.ctaLabel}
            </button>
          )}
          <button
            onClick={close}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant"
            style={{ background: "rgba(148,163,184,0.12)" }}
          >
            {isTrial ? "Ertaga qaytaman" : "Yopish"}
          </button>
        </div>
      </div>
    </div>
  )
}
