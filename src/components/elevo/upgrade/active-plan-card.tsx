import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { RefreshCw } from "@/lib/icons"
import type { LucideIcon } from "@/lib/icons"
import { CornerRibbon } from "@/components/elevo/shared/corner-ribbon"

const ACTIVE_GREEN = "#059669"
const EMPTY_RED    = "#ef4444"

interface ActivePlanCardProps {
  title: string
  description?: string
  icon: LucideIcon
  iconColor: string
  expiresAt: string | null
  paidAt: string | null
  /** Per-skill quota (yangi API) */
  quotaTotal: number
  quotaRemaining: number
  skill: string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const months = [
    "Yanvar","Fevral","Mart","Aprel","May","Iyun",
    "Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr",
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

export function ActivePlanCard({
  title,
  description,
  icon: Icon,
  iconColor,
  expiresAt,
  paidAt,
  quotaTotal,
  quotaRemaining,
  skill,
}: ActivePlanCardProps) {
  const navigate = useNavigate()
  const [displayCount, setDisplayCount] = useState(quotaRemaining)

  useEffect(() => {
    setDisplayCount(quotaRemaining)
  }, [quotaRemaining])

  const isEmpty = displayCount === 0
  const isLow = !isEmpty && displayCount < quotaTotal * 0.2
  const progress = quotaTotal > 0 ? Math.min(100, (displayCount / quotaTotal) * 100) : 0

  const daysLeft = expiresAt ? daysUntil(expiresAt) : null
  const isExpired = expiresAt ? new Date(expiresAt) <= new Date() : false

  const borderColor = (isEmpty || isExpired) ? EMPTY_RED : ACTIVE_GREEN
  const accentColor = (isEmpty || isExpired) ? EMPTY_RED : iconColor

  return (
    <div
      className="relative overflow-hidden elevo-card flex flex-col"
      style={{
        border: `1.5px solid ${borderColor}42`,
        boxShadow: `0 6px 28px rgba(5,150,105,0.10), 0 2px 8px rgba(0,0,0,0.04)`,
      }}
    >
      {/* Top accent stripe */}
      <div
        style={{
          height: 3,
          background: isEmpty || isExpired
            ? `linear-gradient(90deg, ${EMPTY_RED} 0%, #fca5a5 60%)`
            : `linear-gradient(90deg, ${ACTIVE_GREEN} 0%, #34d399 60%, ${ACTIVE_GREEN}55 100%)`,
          borderRadius: "20px 20px 0 0",
          flexShrink: 0,
        }}
      />

      {/* Corner ribbon */}
      <CornerRibbon
        label={isEmpty || isExpired ? "YANGILASH" : "AKTIV"}
        color={isEmpty || isExpired ? EMPTY_RED : ACTIVE_GREEN}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4" style={{ paddingRight: 40 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: accentColor,
              boxShadow: `0 2px 10px ${accentColor}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon className="w-5 h-5 text-white" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-black text-on-surface leading-tight">{title}</h3>
            {description && <p className="text-[11px] text-on-surface-variant mt-0.5">{description}</p>}
            <div className="flex items-center gap-1.5 mt-1">
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isEmpty || isExpired ? EMPTY_RED : ACTIVE_GREEN,
                boxShadow: `0 0 6px ${isEmpty || isExpired ? EMPTY_RED : ACTIVE_GREEN}80`,
              }} />
              <span className="text-[11px] font-bold" style={{ color: isEmpty || isExpired ? EMPTY_RED : ACTIVE_GREEN }}>
                {isEmpty ? "Quota tugadi" : isExpired ? "Muddat tugadi" : "Premium faol"}
              </span>
            </div>
          </div>
        </div>

        {/* Expiry row */}
        <div
          className="flex items-center justify-between rounded-xl px-3.5 py-2.5 mb-3"
          style={{
            background: isEmpty || isExpired ? "rgba(239,68,68,0.06)" : `${ACTIVE_GREEN}0d`,
            border: `1px solid ${isEmpty || isExpired ? "rgba(239,68,68,0.22)" : `${ACTIVE_GREEN}22`}`,
          }}
        >
          <span className="text-[11px] text-on-surface-variant">Amal qilish muddati</span>
          <span className="text-[11px] font-black text-on-surface">
            {expiresAt
              ? isExpired
                ? "Tugagan"
                : `${formatDate(expiresAt)} (${daysLeft} kun)`
              : "Muddatsiz"}
          </span>
        </div>

        {/* Quota progress */}
        <div
          className="rounded-xl px-3.5 py-3 mb-4"
          style={{
            background: isEmpty ? "rgba(239,68,68,0.06)" : isLow ? "rgba(245,158,11,0.07)" : `${accentColor}0d`,
            border: `1px solid ${isEmpty ? "rgba(239,68,68,0.22)" : isLow ? "rgba(245,158,11,0.22)" : `${accentColor}22`}`,
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] text-on-surface-variant">Qolgan imtihonlar / oy</span>
            <span
              className="text-sm font-black tabular-nums"
              style={{ color: isEmpty ? EMPTY_RED : isLow ? "#d97706" : accentColor }}
            >
              {displayCount} <span className="text-[10px] font-semibold text-on-surface-variant">/ {quotaTotal}</span>
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 10, background: "rgba(148,163,184,0.18)" }}>
            <div
              style={{
                height: "100%", borderRadius: 10,
                background: isEmpty ? EMPTY_RED : isLow
                  ? "linear-gradient(90deg, #d97706, #fbbf24)"
                  : `linear-gradient(90deg, ${accentColor}, ${accentColor}bb)`,
                width: `${progress}%`,
                minWidth: progress > 0 ? 8 : 0,
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1), background 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Separator */}
        <div className="mb-3" style={{ height: 1, background: "rgba(148,163,184,0.12)" }} />

        {paidAt && (
          <p className="text-[10px] text-on-surface-variant text-center mb-3">
            Sotib olingan: {formatDate(paidAt)}
          </p>
        )}

        {/* CTA: quota > 0 → "Sotib olingan", quota == 0 → "Premiumni yangilash" */}
        {isEmpty || isExpired ? (
          <button
            onClick={() => navigate(`/upgrade?skill=${skill.toLowerCase()}`)}
            className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            style={{ background: EMPTY_RED, color: "#fff" }}
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} aria-hidden />
            Premiumni yangilash
          </button>
        ) : (
          <div
            className="w-full py-3.5 rounded-xl font-black text-sm text-center"
            style={{ background: `${ACTIVE_GREEN}12`, color: ACTIVE_GREEN }}
          >
            ✓ &nbsp;Sotib olingan
          </div>
        )}
      </div>
    </div>
  )
}
