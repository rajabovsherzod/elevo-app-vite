import { Link } from "react-router"
import { Zap } from "@/lib/icons"
import { useGlobalAccessBadge } from "@/hooks/auth/use-skill-access"
import { useAuthStore } from "@/store/auth.store"

export function QuotaBadge() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const label = useGlobalAccessBadge()

  if (!isAuthenticated || !user || !label) return null

  const isTrial = user.trial?.active
  const isLimitDone = label === "Limit tugadi"
  const hasPaidSkill = Object.values(user.skills ?? {}).some(
    (v) => v.is_paid && v.quota_remaining > 0
  )

  const color = isTrial
    ? "#6366f1"
    : isLimitDone
    ? "#ef4444"
    : hasPaidSkill
    ? "#10b981"
    : "#f59e0b"

  return (
    <Link
      to="/upgrade"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-opacity active:opacity-70"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        color,
      }}
    >
      <Zap className="w-3 h-3" strokeWidth={2.5} aria-hidden />
      {label}
    </Link>
  )
}
