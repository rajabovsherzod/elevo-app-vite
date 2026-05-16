
import { Link } from "react-router";
import { Lock, Zap, Clock, type LucideIcon } from "@/lib/icons";
import type { AccessReason } from "@/hooks/auth/use-skill-access";

interface NeedPaidProps {
  skill: string;
  skillTitle: string;
  skillIcon: LucideIcon;
  skillColor: string;
  upgradeUrl: string;
  reason: AccessReason;
}

export function NeedPaid({
  skillTitle,
  skillIcon: SkillIcon,
  skillColor,
  upgradeUrl,
  reason,
}: NeedPaidProps) {
  const isDailyUsed = reason === "free_daily_exhausted" || reason === "trial_daily_exhausted";
  const isQuotaDone = reason === "skill_quota_exhausted";

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      {/* Accent line — skill rangi */}
      <div className="h-1 w-full" style={{ backgroundColor: skillColor }} />

      <div className="p-5 flex flex-col gap-5">

        {/* Icon + lock badge */}
        <div className="relative w-14 h-14">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: `${skillColor}18`,
              border: `1px solid ${skillColor}28`,
            }}
          >
            <SkillIcon
              className="w-7 h-7"
              style={{ color: skillColor }}
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-surface-container-low border border-primary/10">
            <Lock className="w-3 h-3 text-on-surface-variant" strokeWidth={2.5} aria-hidden />
          </div>
        </div>

        {/* Matn */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {isDailyUsed ? "Kunlik limit" : isQuotaDone ? "Quota tugadi" : "Qulflangan"}
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface leading-tight">
            {isDailyUsed
              ? "Bugungi imkoniyat tugadi"
              : isQuotaDone
                ? "Oylik quota tugadi"
                : `${skillTitle} qulflangan`}
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed mt-0.5">
            {isDailyUsed
              ? "Bugungi bepul limit tugadi. Ertaga soat 00:00 da yangilanadi — yoki to'lov qilib 100 ta examga ega bo'ling."
              : isQuotaDone
                ? "Bu skillning oylik 100 ta imtihon quotasi tugadi. Premiumni yangilang."
                : `${skillTitle} skillidan foydalanish uchun to'lov qiling.`}
          </p>
        </div>

        {/* Separator */}
        <div className="h-px bg-primary/8" />

        {/* Tugmalar */}
        <div className="flex flex-col gap-2.5">
          <Link to={upgradeUrl}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98]"
            style={{ backgroundColor: skillColor }}
          >
            <Zap className="w-4 h-4" strokeWidth={2.5} aria-hidden />
            {skillTitle} — to&apos;lov qilish
          </Link>

          {isDailyUsed && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant pt-1">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span>Keyingi bepul imkoniyat — ertaga 00:00</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
