/* ═══════════════════════════════════════════════════════
   Speaking Part 1.2 — Familiar Topics
   1 konteyner: rasm + 3 ketma-ket savol, har biri 30s audio
   ═══════════════════════════════════════════════════════ */

import { useState } from "react"
import { useNavigate } from "react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { speakingService } from "@/services/speaking.service"
import { QuestionScreen } from "@/components/elevo/speaking/question-screen"
import { SpeakingAnalysis } from "@/components/elevo/speaking/speaking-analysis"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { Loader2 } from "@/lib/icons"
import type { SpeakingEvaluateResponse } from "@/schemas/speaking.schema"
import type { SpeakingPart1_2Response } from "@/schemas/speaking.schema"

const getExamId = () =>
  parseInt(new URLSearchParams(window.location.search).get("exam_id") ?? "1") || 1

type Stage =
  | { type: "loading" }
  | { type: "question"; index: number }
  | { type: "submitting" }
  | { type: "result"; data: SpeakingEvaluateResponse }
  | { type: "error"; message: string }

export default function SpeakingPart1_2Page() {
  const navigate = useNavigate()
  const examId = getExamId()
  const [stage, setStage] = useState<Stage>({ type: "loading" })
  const [audios, setAudios] = useState<Blob[]>([])

  const { data: containerData } = useQuery<SpeakingPart1_2Response>({
    queryKey: ["speaking-part1-2-questions", examId],
    queryFn: () => speakingService.getPart1_2Questions(examId),
    onSuccess: () => setStage({ type: "question", index: 0 }),
    onError: () => setStage({ type: "error", message: "Savollarni yuklashda xatolik." }),
  } as Parameters<typeof useQuery>[0])

  const evaluate = useMutation({
    mutationFn: (audiosToSend: Blob[]) =>
      speakingService.evaluatePart1_2({
        exam_id: (containerData as SpeakingPart1_2Response).exam_id,
        container_id: (containerData as SpeakingPart1_2Response).container_id,
        audios: audiosToSend,
      }),
    onSuccess: (data) => setStage({ type: "result", data }),
    onError: () => setStage({ type: "error", message: "Baholashda xatolik. Qayta urining." }),
  })

  const handleAudioComplete = (blob: Blob | null, index: number, total: number) => {
    const newAudios = [...audios, blob ?? new Blob()]
    setAudios(newAudios)
    if (index + 1 < total) {
      setStage({ type: "question", index: index + 1 })
    } else {
      setStage({ type: "submitting" })
      evaluate.mutate(newAudios)
    }
  }

  const questions = containerData?.questions ?? []

  if (stage.type === "result") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Part 1.2 — Natija" onBack={() => navigate("/speaking")} />
        <SpeakingAnalysis results={[stage.data]} onFinish={() => navigate("/speaking")} />
      </div>
    )
  }

  if (stage.type === "error") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Part 1.2" onBack={() => navigate("/speaking")} />
        <div className="flex flex-col items-center gap-4 pt-12">
          <p className="text-on-surface-variant text-center text-sm">{stage.message}</p>
          <button onClick={() => navigate("/speaking")} className="elevo-btn-primary px-6 py-3 rounded-xl font-bold">
            Orqaga qaytish
          </button>
        </div>
      </div>
    )
  }

  if (stage.type === "submitting") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Part 1.2" hideBackButton />
        <div className="flex flex-col items-center justify-center gap-4 pt-16">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">AI baholamoqda...</p>
          <p className="text-on-surface-variant/60 text-xs">Bu 20–40 soniya olishi mumkin</p>
        </div>
      </div>
    )
  }

  if (stage.type === "loading" || !questions.length) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Part 1.2 — Familiar Topics" />
        <div className="flex flex-col items-center justify-center gap-3 pt-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-on-surface-variant text-sm">Savollar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  const currentIndex = stage.type === "question" ? stage.index : 0
  const currentQuestion = questions[currentIndex]

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeaderWithBack
        title="Part 1.2 — Familiar Topics"
        description={`Savol ${currentIndex + 1} / ${questions.length}`}
      />

      {/* Rasm — hamma savollar uchun bir xil rasm ko'rinadi */}
      {containerData?.image && (
        <div className="elevo-card overflow-hidden rounded-2xl">
          <img
            src={containerData.image}
            alt="Speaking topic"
            className="w-full h-40 object-cover"
          />
        </div>
      )}

      <QuestionScreen
        key={currentIndex}
        question={currentQuestion.question}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        duration={30}
        onComplete={(blob) => handleAudioComplete(blob, currentIndex, questions.length)}
      />
    </div>
  )
}
