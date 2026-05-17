/* ═══════════════════════════════════════════════════════
   Speaking Part 2 — Long Turn (rasm + bitta uzun recording)
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

const getExamId = () => parseInt(new URLSearchParams(window.location.search).get("exam_id") ?? "1") || 1

type Stage =
  | { type: "loading" }
  | { type: "question" }
  | { type: "submitting" }
  | { type: "result"; data: SpeakingEvaluateResponse }
  | { type: "error"; message: string }

export default function SpeakingPart2Page() {
  const navigate = useNavigate()
  const examId = getExamId()
  const [stage, setStage] = useState<Stage>({ type: "loading" })

  const { data: questionsData } = useQuery({
    queryKey: ["speaking-part2-question", examId],
    queryFn: () => speakingService.getPart2Question(examId),
    onSuccess: () => setStage({ type: "question" }),
  } as Parameters<typeof useQuery>[0])

  const evaluate = useMutation({
    mutationFn: (audio: Blob) => {
      const q = questionsData!.questions[0]
      return speakingService.evaluatePart2(questionsData!.exam_id, q.id, audio)
    },
    onSuccess: (data) => setStage({ type: "result", data }),
    onError: () => setStage({ type: "error", message: "Baholashda xatolik. Qayta urining." }),
  })

  const question = questionsData?.questions[0]

  if (stage.type === "result") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 2 — Natija" onBack={() => navigate("/speaking")} />
        <SpeakingAnalysis results={[stage.data]} onFinish={() => navigate("/speaking")} />
      </div>
    )
  }

  if (stage.type === "error") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Part 2" />
        <div className="flex flex-col items-center gap-4 pt-12">
          <p className="text-on-surface-variant text-center">{stage.message}</p>
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
        <PageHeaderWithBack title="Part 2 — Long Turn" hideBackButton />
        <div className="flex flex-col items-center justify-center gap-4 pt-16">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">AI baholamoqda...</p>
          <p className="text-on-surface-variant/60 text-xs">Bu 15–30 soniya olishi mumkin</p>
        </div>
      </div>
    )
  }

  if (stage.type === "loading" || !question) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Part 2 — Long Turn" />
        <div className="flex flex-col items-center justify-center gap-3 pt-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-on-surface-variant text-sm">Savol yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeaderWithBack title="Part 2 — Long Turn" description="2 daqiqa monolog" />

      {/* Instruction */}
      {question.instruction && (
        <div className="elevo-card elevo-card-border px-4 py-3">
          <p className="text-xs text-on-surface-variant italic">{question.instruction}</p>
        </div>
      )}

      {/* Rasm */}
      {question.image && (
        <div className="elevo-card overflow-hidden rounded-2xl">
          <img
            src={question.image}
            alt="Speaking topic"
            className="w-full h-44 object-cover"
          />
        </div>
      )}

      <QuestionScreen
        question={question.question ?? ""}
        questionNumber={1}
        totalQuestions={1}
        duration={120}
        onComplete={(blob) => {
          setStage({ type: "submitting" })
          evaluate.mutate(blob ?? new Blob())
        }}
      />
    </div>
  )
}
