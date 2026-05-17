import { useNavigate } from "react-router"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { SpeakingAnalysis } from "@/components/elevo/speaking/speaking-analysis"
import { Part1_1Introduction } from "@/components/elevo/speaking/part-1-1/part1-1-introduction"
import { Part1_1QuestionStage } from "@/components/elevo/speaking/part-1-1/part1-1-question-stage"
import { Part1_1Calculating } from "@/components/elevo/speaking/part-1-1/part1-1-calculating"
import { usePart1_1Flow } from "@/hooks/speaking/use-part1-1-flow"
import { Loader2 } from "@/lib/icons"

const getExamId = () =>
  parseInt(new URLSearchParams(window.location.search).get("exam_id") ?? "1") || 1

export default function SpeakingPart1_1Page() {
  const navigate = useNavigate()
  const examId = getExamId()
  const {
    phase, stream, streamReady,
    questions, visualizer,
    handleIntroEnded, handleEarlyStop, handleRetry, handleFinishResult,
  } = usePart1_1Flow(examId)

  if (phase.type === "result") {
    const leaveResult = () => { handleFinishResult(); navigate("/speaking") }
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 1.1 — Natija" onBack={leaveResult} />
        <SpeakingAnalysis results={[phase.data]} onFinish={leaveResult} />
      </div>
    )
  }

  if (phase.type === "error") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Part 1.1" onBack={() => navigate("/speaking")} />
        <div className="flex flex-col items-center gap-4 pt-12 px-4">
          <p className="text-on-surface-variant text-center text-sm">{phase.message}</p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="elevo-btn-primary px-6 py-3 rounded-xl font-bold text-sm"
            >
              Qayta urinish
            </button>
            <button
              onClick={() => navigate("/speaking")}
              className="px-6 py-3 rounded-xl font-bold text-sm border border-outline-variant text-on-surface-variant"
            >
              Orqaga
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase.type === "calculating") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Personal questions" hideBackButton />
        <Part1_1Calculating />
      </div>
    )
  }

  // Mic permission waiting
  if (phase.type === "question" && !streamReady) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Personal questions" />
        <div className="elevo-card elevo-card-border px-4 py-4 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          <span className="text-[13px] font-medium text-primary">
            Mikrofon ruxsati so'ralmoqda...
          </span>
        </div>
      </div>
    )
  }

  // Questions loading
  if (phase.type === "question" && !questions.length) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Personal questions" />
        <div className="flex flex-col items-center justify-center gap-3 pt-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-on-surface-variant text-sm">Savollar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeaderWithBack title={phase.type === "intro" ? "Part 1.1" : "Personal questions"} />

      {phase.type === "intro" && (
        <Part1_1Introduction onComplete={handleIntroEnded} />
      )}

      {phase.type === "question" && stream && questions[phase.index] && (
        <Part1_1QuestionStage
          question={questions[phase.index].question ?? ""}
          questionNumber={phase.index + 1}
          totalQuestions={3}
          stage={phase.stage}
          timeLeft={phase.timeLeft}
          stream={stream}
          visualizer={visualizer}
          onEarlyStop={handleEarlyStop}
        />
      )}
    </div>
  )
}
