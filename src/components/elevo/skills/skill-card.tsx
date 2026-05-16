import { Link } from "react-router"
import type { LucideIcon } from "@/lib/icons"
import type { SkillInfo } from "@/types/auth.types"
import { CornerRibbon } from "@/components/elevo/shared/corner-ribbon"

const ACTIVE_GREEN = "#059669"
const EXPIRED_RED  = "#ef4444"

interface SkillCardProps {
  icon: LucideIcon
  title: string
  count: number
  href: string
  info?: SkillInfo
  prefetchFn?: () => void
}

function getStatus(info?: SkillInfo): "free" | "active" | "expired" {
  if (!info?.is_paid) return "free"
  const expired = info.expires_at ? new Date(info.expires_at) <= new Date() : false
  if (info.quota_remaining === 0 || expired) return "expired"
  return "active"
}

export function SkillCard({ icon: Icon, title, count, href, info, prefetchFn }: SkillCardProps) {
  const status = getStatus(info)

  const borderStyle =
    status === "active"
      ? { border: `1.5px solid ${ACTIVE_GREEN}42`, boxShadow: `0 4px 18px ${ACTIVE_GREEN}18` }
      : status === "expired"
      ? { border: `1.5px solid ${EXPIRED_RED}42`, boxShadow: `0 4px 18px ${EXPIRED_RED}10` }
      : { border: "1px solid rgba(148,163,184,0.18)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }

  const accentStripe =
    status === "active"
      ? `linear-gradient(90deg, ${ACTIVE_GREEN} 0%, #34d399 60%, ${ACTIVE_GREEN}55 100%)`
      : status === "expired"
      ? `linear-gradient(90deg, ${EXPIRED_RED} 0%, #fca5a5 60%)`
      : "linear-gradient(90deg, var(--el-primary, #6366f1) 0%, #9333ea 100%)"

  return (
    <Link
      to={href}
      className="relative overflow-hidden elevo-card-hover elevo-card flex flex-col text-center"
      style={borderStyle}
      onPointerEnter={prefetchFn}
    >
      {/* Top accent stripe */}
      <div style={{ height: 3, background: accentStripe, borderRadius: "20px 20px 0 0", flexShrink: 0 }} />

      {/* Corner ribbon — faqat paid skillarda */}
      {status === "active"  && <CornerRibbon label="PRO" color={ACTIVE_GREEN} />}
      {status === "expired" && <CornerRibbon label="YANGILASH" color={EXPIRED_RED} />}

      <div className="p-5 flex flex-col items-center flex-1">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{
            background:
              status === "active" ? `${ACTIVE_GREEN}15` :
              status === "expired" ? `${EXPIRED_RED}10` :
              "rgba(99,102,241,0.10)",
            border:
              status === "active" ? `1px solid ${ACTIVE_GREEN}25` :
              status === "expired" ? `1px solid ${EXPIRED_RED}20` :
              "1px solid rgba(99,102,241,0.18)",
          }}
        >
          <Icon
            className="w-6 h-6"
            style={{
              color:
                status === "active" ? ACTIVE_GREEN :
                status === "expired" ? EXPIRED_RED :
                "var(--el-primary, #6366f1)",
            }}
          />
        </div>

        <span className="text-sm font-bold text-on-surface mb-1">{title}</span>
        <span className="text-xs text-on-surface-variant">{count} exercises</span>

        {/* Status indicator for paid skills */}
        {status === "active" && info && (
          <div className="mt-2.5 flex flex-col items-center gap-1 w-full">
            <div className="flex items-center gap-1.5">
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: ACTIVE_GREEN, boxShadow: `0 0 5px ${ACTIVE_GREEN}80` }} />
              <span className="text-[10px] font-bold" style={{ color: ACTIVE_GREEN }}>
                {info.quota_remaining}/{info.quota_total} qoldi
              </span>
            </div>
            <div style={{ width: "100%", height: 3, borderRadius: 10, background: "rgba(148,163,184,0.18)" }}>
              <div
                style={{
                  height: "100%", borderRadius: 10,
                  background: ACTIVE_GREEN,
                  width: `${info.quota_total > 0 ? (info.quota_remaining / info.quota_total) * 100 : 0}%`,
                  transition: "width 0.6s ease",
                  minWidth: info.quota_remaining > 0 ? 4 : 0,
                }}
              />
            </div>
          </div>
        )}

        {status === "expired" && (
          <div className="mt-2 flex items-center gap-1">
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: EXPIRED_RED }} />
            <span className="text-[10px] font-bold" style={{ color: EXPIRED_RED }}>
              {info?.quota_remaining === 0 ? "Quota tugadi" : "Muddat tugadi"}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
