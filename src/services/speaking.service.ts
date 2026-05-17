import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  speakingEvaluateResponseSchema,
  speakingQuestionsResponseSchema,
  speakingPart1_1ResponseSchema,
  speakingPart1_2ResponseSchema,
  type SpeakingEvaluateResponse,
  type SpeakingQuestionsResponse,
  type SpeakingPart1_1Response,
  type SpeakingPart1_2Response,
} from "@/schemas/speaking.schema";
import type { SpeakingMultiAudioRequest, SpeakingPart1_2EvaluateRequest, SpeakingPart3Request } from "@/types/speaking.types";

// ── Question fetchers ─────────────────────────────────────────────────────────

async function getQuestions(url: string): Promise<SpeakingQuestionsResponse> {
  const { data } = await apiClient.get(url);
  return speakingQuestionsResponseSchema.parse(data);
}

export const speakingService = {
  // GET questions
  getPart1_1Questions: async (examId: number): Promise<SpeakingPart1_1Response> => {
    const { data } = await apiClient.get(ENDPOINTS.speaking.part1_1.question(examId));
    return speakingPart1_1ResponseSchema.parse(data);
  },

  getPart1_2Questions: async (examId: number): Promise<SpeakingPart1_2Response> => {
    const { data } = await apiClient.get(ENDPOINTS.speaking.part1_2.question(examId));
    return speakingPart1_2ResponseSchema.parse(data);
  },

  getPart2Question: (examId: number) =>
    getQuestions(ENDPOINTS.speaking.part2.question(examId)),

  getPart3Questions: (examId: number) =>
    getQuestions(ENDPOINTS.speaking.part3.question(examId)),

  // ── Evaluate: Part 1.1 (3 audios + part_ids) ─────────────────────────────

  evaluatePart1_1: async (payload: SpeakingMultiAudioRequest): Promise<SpeakingEvaluateResponse> => {
    const form = new FormData();
    form.append("part_ids", JSON.stringify(payload.part_ids));
    payload.audios.forEach((audio, i) => {
      if (audio instanceof File) {
        form.append(`audio_${i + 1}`, audio)
      } else {
        const mime = audio.type || "audio/webm"
        const ext = mime.includes("mp4") ? "mp4" : mime.includes("ogg") ? "ogg" : "webm"
        form.append(`audio_${i + 1}`, new File([audio], `audio_${i + 1}.${ext}`, { type: mime }))
      }
    });
    const { data } = await apiClient.post(
      ENDPOINTS.speaking.part1_1.evaluate(payload.exam_id),
      form,
      { timeout: 120_000 },
    );
    return speakingEvaluateResponseSchema.parse(data);
  },

  // ── Evaluate: Part 1.2 (container_id + 3 audios) ────────────────────────

  evaluatePart1_2: async (payload: SpeakingPart1_2EvaluateRequest): Promise<SpeakingEvaluateResponse> => {
    const form = new FormData();
    form.append("container_id", String(payload.container_id));
    payload.audios.forEach((audio, i) => {
      form.append(`audio_${i + 1}`, audio instanceof File ? audio : new File([audio], `audio_${i + 1}.webm`, { type: "audio/webm" }));
    });
    const { data } = await apiClient.post(
      ENDPOINTS.speaking.part1_2.evaluate(payload.exam_id),
      form,
      { timeout: 120_000 },
    );
    return speakingEvaluateResponseSchema.parse(data);
  },

  // ── Evaluate: Part 2 (1 audio, part_id in URL) ───────────────────────────

  evaluatePart2: async (examId: number, partId: number, audio: Blob): Promise<SpeakingEvaluateResponse> => {
    const form = new FormData();
    form.append("audio", audio instanceof File ? audio : new File([audio], "audio.webm", { type: "audio/webm" }));
    const { data } = await apiClient.post(
      ENDPOINTS.speaking.part2.evaluate(examId, partId),
      form,
      { timeout: 120_000 },
    );
    return speakingEvaluateResponseSchema.parse(data);
  },

  // ── Evaluate: Part 3 (1 audio, part_ids in body) ─────────────────────────

  evaluatePart3: async (payload: SpeakingPart3Request): Promise<SpeakingEvaluateResponse> => {
    const form = new FormData();
    form.append("part_ids", JSON.stringify(payload.part_ids));
    form.append("audio", payload.audio instanceof File ? payload.audio : new File([payload.audio], "audio.webm", { type: "audio/webm" }));
    const { data } = await apiClient.post(
      ENDPOINTS.speaking.part3.evaluate(payload.exam_id),
      form,
      { timeout: 120_000 },
    );
    return speakingEvaluateResponseSchema.parse(data);
  },
};
