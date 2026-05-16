import { useAuthStore } from "@/store/auth.store";
import type { SkillName } from "@/types/auth.types";

export type AccessReason =
  | "trial"                   // 3 kunlik sinov davri faol
  | "paid"                    // Bu skill uchun to'lov qilingan va quota bor
  | "free_daily"              // Bugungi bepul imkoniyat mavjud (global quota)
  | "skill_quota_exhausted"   // Paid skill, lekin quota tugadi
  | "trial_daily_exhausted"   // Trial kvotasi tugadi (kuniga 25)
  | "free_daily_exhausted"    // Kunlik bepul tugadi
  | "loading";

export interface SkillAccessResult {
  canAccess: boolean;
  reason: AccessReason;
  showUpgrade: boolean;
  upgradeUrl: string;
  badgeLabel: string | null;
}

export function useSkillAccess(skill: SkillName): SkillAccessResult {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const upgradeUrl = `/payment?plan=${skill}`;

  // user yoki token yo'q bo'lsa → loading (splash provider hal qiladi)
  if (!user || !isAuthenticated) {
    return { canAccess: false, reason: "loading", showUpgrade: false, upgradeUrl, badgeLabel: null };
  }

  const skillInfo = user.skills?.[skill];
  const gq = user.global_quota;

  // 1. Paid skill (va quota bor)
  if (skillInfo?.is_paid && skillInfo.quota_remaining > 0) {
    return {
      canAccess: true,
      reason: "paid",
      showUpgrade: false,
      upgradeUrl,
      badgeLabel: `${skillInfo.quota_remaining}/${skillInfo.quota_total}`,
    };
  }

  // 2. Paid skill, lekin quota 0 — "Yangilash" ko'rsatamiz
  if (skillInfo?.is_paid && skillInfo.quota_remaining === 0) {
    return {
      canAccess: false,
      reason: "skill_quota_exhausted",
      showUpgrade: true,
      upgradeUrl: `/upgrade?skill=${skill}`,
      badgeLabel: "Quota tugadi",
    };
  }

  // 3. Trial davri (global)
  if (user.trial?.active) {
    const daysLeft = user.trial.days_left ?? 1;
    const remaining = gq?.remaining ?? 0;
    if (remaining > 0) {
      return {
        canAccess: true,
        reason: "trial",
        showUpgrade: false,
        upgradeUrl,
        badgeLabel: `Trial: ${daysLeft} kun · ${remaining}/${gq?.total ?? 25}`,
      };
    }
    return {
      canAccess: false,
      reason: "trial_daily_exhausted",
      showUpgrade: false,
      upgradeUrl,
      badgeLabel: `${gq?.total ?? 25} ta limit tugadi`,
    };
  }

  // 4. Kunlik bepul (REGULAR)
  if (gq && gq.remaining > 0) {
    return {
      canAccess: true,
      reason: "free_daily",
      showUpgrade: false,
      upgradeUrl,
      badgeLabel: `Bepul: ${gq.remaining}/${gq.total}`,
    };
  }

  // 5. Hech narsa yo'q
  return {
    canAccess: false,
    reason: "free_daily_exhausted",
    showUpgrade: true,
    upgradeUrl: `/upgrade?skill=${skill}`,
    badgeLabel: null,
  };
}

/** Header QuotaBadge uchun — eng muhim ma'lumot */
export function useGlobalAccessBadge(): string | null {
  const user = useAuthStore((s) => s.user);
  if (!user || user.trial === undefined) return null;

  const gq = user.global_quota;

  if (user.trial?.active) {
    const daysLeft = user.trial.days_left ?? 1;
    const remaining = gq?.remaining ?? 0;
    return `Trial: ${daysLeft} kun · ${remaining}/${gq?.total ?? 25}`;
  }

  // Paid skill bormi? Eng past quota'sini ko'rsat
  const paidSkills = Object.entries(user.skills ?? {})
    .filter(([, v]) => v.is_paid && v.quota_remaining > 0)
    .map(([, v]) => v);

  if (paidSkills.length > 0) {
    const min = paidSkills.reduce((a, b) => a.quota_remaining < b.quota_remaining ? a : b);
    return `${min.quota_remaining}/${min.quota_total} exam`;
  }

  if (gq && gq.remaining > 0) {
    return `Bepul: ${gq.remaining}/${gq.total}`;
  }

  return "Limit tugadi";
}
