import { z } from "zod";

const cefrSchema = z.enum(["B1_Below", "Below B1", "B1", "B2", "C1"]);

const bilingualSchema = z.object({
  uz: z.string(),
  en: z.string(),
});

const improvedVersionSchema = z.object({
  text: z.string(),
  level_rationale: z.string(),
});

// ── Evaluate response ─────────────────────────────────────────────────────────

export const speakingEvaluateResponseSchema = z.object({
  attempt_id: z.number(),
  speaking_result_id: z.number(),
  transcript: z.string().nullable().optional(),
  metrics: z.object({
    word_count: z.number(),
    pause_count: z.number(),
    duration_seconds: z.number().nullable(),
    speaking_speed_wpm: z.number().nullable(),
    filler_ratio: z.number(),
  }),
  result: z.object({
    part_type: z.string(),
    fluency: z.number().min(0).max(8),
    vocabulary: z.number().min(0).max(8),
    grammar: z.number().min(0).max(8),
    pronunciation: z.number().min(0).max(8),
    total_32: z.number().min(0).max(32),
    cefr: cefrSchema,
    feedback: z.object({
      strengths: bilingualSchema,
      weaknesses: bilingualSchema,
      improvements: bilingualSchema,
    }),
    improved_versions: z.object({
      b2: improvedVersionSchema,
      c1: improvedVersionSchema,
    }).optional(),
  }),
});

export type SpeakingEvaluateResponse = z.infer<typeof speakingEvaluateResponseSchema>;

// ── Part 1.1 — 3 random personal questions ───────────────────────────────────

export const speakingPart1_1QuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
});

export const speakingPart1_1ResponseSchema = z.object({
  exam_id: z.number(),
  part_type: z.literal("PART1_1"),
  questions: z.array(speakingPart1_1QuestionSchema),
});

export type SpeakingPart1_1Response = z.infer<typeof speakingPart1_1ResponseSchema>;

// ── Part 1.2 — Container (image + 3 ordered questions) ───────────────────────

export const speakingPart1_2QuestionSchema = z.object({
  id: z.number(),
  order: z.number(),
  question: z.string(),
});

export const speakingPart1_2ResponseSchema = z.object({
  exam_id: z.number(),
  part_type: z.literal("PART1_2"),
  container_id: z.number(),
  image: z.string().nullable().optional(),
  questions: z.array(speakingPart1_2QuestionSchema),
});

export type SpeakingPart1_2Response = z.infer<typeof speakingPart1_2ResponseSchema>;

// ── Part 2 / Part 3 — legacy generic question schema ─────────────────────────

export const speakingQuestionSchema = z.object({
  id: z.number(),
  title: z.string().nullable().optional(),
  question: z.string().nullable().optional(),
  instruction: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  image_description: z.string().nullable().optional(),
});

export type SpeakingQuestion = z.infer<typeof speakingQuestionSchema>;

export const speakingQuestionsResponseSchema = z.object({
  exam_id: z.number(),
  part_type: z.string(),
  questions: z.array(speakingQuestionSchema),
});

export type SpeakingQuestionsResponse = z.infer<typeof speakingQuestionsResponseSchema>;

// Legacy
export type SpeakingEvaluateResponseSchema = SpeakingEvaluateResponse;
