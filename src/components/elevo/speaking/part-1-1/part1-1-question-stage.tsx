import { useEffect, useRef } from "react"
import type { useAudioVisualizer } from "@/hooks/speaking/use-audio-visualizer"

interface Part1_1QuestionStageProps {
  question: string
  questionNumber: number
  totalQuestions: number
  stage: "prep" | "beep" | "record"
  timeLeft: number
  stream: MediaStream | null
  visualizer: ReturnType<typeof useAudioVisualizer>
  onEarlyStop: () => void
}

const PREP_SECONDS = 5
const RECORD_SECONDS = 30

export function Part1_1QuestionStage({
  question,
  questionNumber,
  totalQuestions,
  stage,
  timeLeft,
  stream,
  visualizer,
  onEarlyStop,
}: Part1_1QuestionStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isRecord = stage === "record"
  const totalTime = stage === "prep" ? PREP_SECONDS : RECORD_SECONDS
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0

  // Start/stop visualizer when recording starts/stops
  useEffect(() => {
    const canvas = canvasRef.current
    if (stage !== "record" || !stream || !canvas) {
      visualizer.stop()
      return
    }
    visualizer.start(stream, canvas)
    return () => { visualizer.stop() }
  }, [stage, stream, visualizer])

  return (
    <div className="flex flex-col gap-3 animate-fade-in">

      {/* ── Timer card ─────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-primary ${
              isRecord ? "animate-pulse" : "animate-ping"
            }`} />
            <span className="text-[13px] font-bold text-primary">
              {stage === "prep" ? "Tayyorlaning..." : stage === "beep" ? "Signal..." : "Yozilmoqda"}
            </span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[22px] font-black tabular-nums leading-none text-primary">
              {timeLeft}
            </span>
            <span className="text-[12px] text-on-surface-variant font-medium">s</span>
          </div>
        </div>
        <div className="h-1 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Progress dots ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-1.5 shrink-0">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < questionNumber ? "bg-primary w-5" : "bg-surface-container-high w-3"
              }`}
            />
          ))}
        </div>
        <span className="text-[12px] font-bold text-on-surface-variant ml-1">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* ── Question card ──────────────────────────────────────────── */}
      <div className="elevo-card border border-outline-variant/40 px-5 py-8 flex items-center justify-center min-h-[148px]">
        <p className="text-[20px] font-bold text-on-surface leading-snug text-center">
          {question}
        </p>
      </div>

      {/* ── Waveform ───────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border px-4 py-3">
        <canvas
          ref={canvasRef}
          className={`w-full h-[60px] transition-opacity duration-500 ${
            stage === "prep" ? "opacity-20" : "opacity-100"
          }`}
        />
        {isRecord && (
          <div className="flex justify-center mt-2">
            <button
              onClick={onEarlyStop}
              className="text-[12px] text-on-surface-variant/50 hover:text-on-surface-variant underline underline-offset-2 active:opacity-60 transition-colors"
            >
              Erta tugatish
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
