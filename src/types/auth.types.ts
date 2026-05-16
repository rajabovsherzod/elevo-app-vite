export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface TelegramAuthRequest {
  init_data: string;
}

export interface TelegramAuthResponse extends AuthTokens {
  user: AuthUser;
}

// ─── Yangi API formati (v2) ────────────────────────────────────────────────
export interface SkillInfo {
  is_paid: boolean;
  quota_total: number;
  quota_remaining: number;
  expires_at: string | null;
  paid_at: string | null;
}

export interface SkillsMap {
  reading: SkillInfo;
  listening: SkillInfo;
  writing: SkillInfo;
  speaking: SkillInfo;
}

export interface GlobalQuota {
  kind: 'trial_daily' | 'free_daily';
  total: number;
  remaining: number;
  resets_at: string;
}

export interface TrialInfo {
  active: boolean;
  ends_at: string | null;
  days_left: number;
  /**
   * Backend birinchi /auth/me chaqiriqda true qaytaradi, keyin false.
   * WelcomeTrialModal faqat shu true bo'lganda chiqadi (server-side guard).
   * Agar backend hali bu fieldni bermasa — undefined, localStorage fallback ishlaydi.
   */
  is_first_session?: boolean;
}

export type SkillName = keyof SkillsMap;
export type UserStatus = "NEW" | "REGULAR";

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  full_name: string | null;
  photo: string | null;
  telegram_id: number | null;
  telegram_username: string | null;
  telegram_name: string | null;
  telegram_phone: string | null;
  role: "ADMIN" | "STUDENT" | null;
  status: UserStatus | null;

  // v2 access fields
  trial?: TrialInfo;
  global_quota?: GlobalQuota;
  skills?: SkillsMap;
}

// ─── Yordamchi funksiyalar ────────────────────────────────────────────────

export function getDisplayName(user: AuthUser | null): string {
  if (!user) return "Foydalanuvchi";
  return user.full_name || user.telegram_name || user.username || "Foydalanuvchi";
}

export function getInitial(user: AuthUser | null): string {
  return getDisplayName(user).charAt(0).toUpperCase();
}

export function isTrialActive(user: AuthUser | null): boolean {
  return !!(user?.trial?.active);
}

/** Bu skill uchun to'lov qilingan va quota bor */
export function isSkillPaid(user: AuthUser | null, skill: SkillName): boolean {
  const info = user?.skills?.[skill];
  return !!(info?.is_paid && info.quota_remaining > 0);
}

/** Global bepul slot mavjud */
export function hasGlobalQuota(user: AuthUser | null): boolean {
  if (!user?.global_quota) return false;
  if (user.global_quota.kind === 'trial_daily' || user.global_quota.kind === 'free_daily') {
    return user.global_quota.remaining > 0;
  }
  return false;
}
