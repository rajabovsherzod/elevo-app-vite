import type { CefrLevel } from "./api.types";

export type SpeakingPartType = "PART_1_1" | "PART_1_2" | "PART_2" | "PART_3";

// ── Part 1.1 evaluate request (3 question id + 3 audios) ─────────────────────

export interface SpeakingMultiAudioRequest {
  exam_id: number;
  part_ids: number[];
  audios: Blob[];
}

// ── Part 1.2 evaluate request (container_id + 3 audios) ──────────────────────

export interface SpeakingPart1_2EvaluateRequest {
  exam_id: number;
  container_id: number;
  audios: Blob[];
}

// ── Single-audio evaluate request (Part 2 va 3) ──────────────────────────────

export interface SpeakingEvaluateRequest {
  part_id: number;
  exam_id: number;
  part_type: SpeakingPartType | string;
  audio?: File | Blob;
  transcript?: string;
  image_context?: string;
}

// ── Part 3 (bitta audio, bir necha part_ids) ─────────────────────────────────

export interface SpeakingPart3Request {
  exam_id: number;
  part_ids: number[];
  audio: Blob;
}

// ── Result types ──────────────────────────────────────────────────────────────

export interface SpeakingMetrics {
  word_count: number;
  pause_count: number;
  duration_seconds: number | null;
  speaking_speed_wpm: number | null;
  filler_ratio: number;
}

export interface SpeakingFeedback {
  strengths: { uz: string; en: string };
  weaknesses: { uz: string; en: string };
  improvements: { uz: string; en: string };
}

export interface ImprovedVersion {
  text: string;
  level_rationale: string;
}

export interface ImprovedVersions {
  b2: ImprovedVersion;
  c1: ImprovedVersion;
}

export interface SpeakingResult {
  part_type: SpeakingPartType;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  total_32: number;
  cefr: CefrLevel;
  feedback: SpeakingFeedback;
  improved_versions?: ImprovedVersions;
}

export interface SpeakingEvaluateResponse {
  attempt_id: number;
  speaking_result_id: number;
  transcript?: string | null;
  metrics: SpeakingMetrics;
  result: SpeakingResult;
}
