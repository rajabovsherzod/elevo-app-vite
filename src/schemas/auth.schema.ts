import { z } from "zod";

const skillInfoSchema = z.object({
  is_paid: z.boolean(),
  quota_total: z.number(),
  quota_remaining: z.number(),
  expires_at: z.string().nullable(),
  paid_at: z.string().nullable(),
});

const skillsMapSchema = z.object({
  reading: skillInfoSchema,
  listening: skillInfoSchema,
  writing: skillInfoSchema,
  speaking: skillInfoSchema,
});

const globalQuotaSchema = z.object({
  kind: z.enum(["trial_daily", "free_daily"]),
  total: z.number(),
  remaining: z.number(),
  resets_at: z.string(),
});

const trialInfoSchema = z.object({
  active: z.boolean(),
  ends_at: z.string().nullable(),
  days_left: z.number(),
  is_first_session: z.boolean().optional(),
});

export const authUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().nullable(),
  full_name: z.string().nullable(),
  photo: z.string().nullable(),
  telegram_id: z.number().nullable(),
  telegram_username: z.string().nullable(),
  telegram_name: z.string().nullable(),
  telegram_phone: z.string().nullable(),
  role: z.enum(["ADMIN", "STUDENT"]).nullable(),
  status: z.enum(["NEW", "REGULAR"]).nullable(),
  // Rich fields — present in both /auth/telegram and /auth/me responses
  skills: skillsMapSchema.optional(),
  trial: trialInfoSchema.optional(),
  global_quota: globalQuotaSchema.optional(),
});

export const telegramAuthResponseSchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1),
  user: authUserSchema,
});

export type TelegramAuthResponseSchema = z.infer<typeof telegramAuthResponseSchema>;
