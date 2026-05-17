/* ═══════════════════════════════════════════════════════
   Speaking Part 3 — Discussion (3 savol, 1 audio)
   Barcha 3 savol bir ekranda, bitta recording
   ═══════════════════════════════════════════════════════ */

import { useState } from "react"
import { useNavigate } from "react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { speakingService } from "@/services/speaking.service"
import { SpeakingAnalysis } from "@/components/elevo/speaking/speaking-analysis"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { Loader2, Mic, MicOff } from "@/lib/icons"
import type { SpeakingEvaluateResponse } from "@/schemas/speaking.schema"

const getExamId = () => parseInt(new URLSearchParams(window.location.search).get("exam_id") ?? "1") || 1

type Stage =
  | { type: "loading" }
  | { type: "ready" }
  | { type: "recording" }
  | { type: "submitting" }
  | { type: "result"; data: SpeakingEvaluateResponse }
  | { type: "error"; message: string }

export default function SpeakingPart3Page() {
  const navigate = useNavigate()
  const examId = getExamId()
  const [stage, setStage] = useState<Stage>({ type: "loading" })
  const [recordTime, setRecordTime] = useState(180)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null)

  const { data: questionsData } = useQuery({
    queryKey: ["speaking-part3-questions", examId],
    queryFn: () => speakingService.getPart3Questions(examId),
    onSuccess: () => setStage({ type: "ready" }),
  } as Parameters<typeof useQuery>[0])

  const evaluate = useMutation({
    mutationFn: (audio: Blob) =>
      speakingService.evaluatePart3({
        exam_id: questionsData!.exam_id,
        part_ids: questionsData!.questions.map((q) => q.id),
        audio,
      }),
    onSuccess: (data) => setStage({ type: "result", data }),
    onError: () => setStage({ type: "error", message: "Baholashda xatolik. Qayta urining." }),
  })

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const audio = new Blob(chunks, { type: "audio/webm" })
        setStage({ type: "submitting" })
        evaluate.mutate(audio)
      }

      recorder.start(100)
      setMediaRecorder(recorder)
      setStage({ type: "recording" })

      let time = 180
      const interval = setInterval(() => {
        time -= 1
        setRecordTime(time)
        if (time <= 0) {
          clearInterval(interval)
          recorder.stop()
        }
      }, 1000)
      setTimerRef(interval)
    } catch {
      setStage({ type: "error", message: "Mikrofon ruxsati kerak." })
    }
  }

  const stopRecording = () => {
    if (timerRef) clearInterval(timerRef)
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
    }
  }

  const questions = questionsData?.questions ?? []
  const mins = Math.floor(recordTime / 60)
  const secs = recordTime % 60

  if (stage.type === "result") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 3 — Natija" onBack={() => navigate("/speaking")} />
        <SpeakingAnalysis results={[stage.data]} onFinish={() => navigate("/speaking")} />
      </div>
    )
  }

  if (stage.type === "error") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Part 3" />
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
        <PageHeaderWithBack title="Part 3 — Discussion" hideBackButton />
        <div className="flex flex-col items-center justify-center gap-4 pt-16">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">AI baholamoqda...</p>
          <p className="text-on-surface-variant/60 text-xs">Bu 15–30 soniya olishi mumkin</p>
        </div>
      </div>
    )
  }

  if (stage.type === "loading" || !questions.length) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeaderWithBack title="Part 3 — Discussion" />
        <div className="flex flex-col items-center justify-center gap-3 pt-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-on-surface-variant text-sm">Savollar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeaderWithBack title="Part 3 — Discussion" description="3 ta savol, bitta recording" />

      {/* Questions list */}
      <div className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <div key={q.id} className="elevo-card elevo-card-border p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">
              Savol {i + 1}
            </span>
            {q.instruction && (
              <p className="text-xs text-on-surface-variant italic mb-1">{q.instruction}</p>
            )}
            <p className="text-sm font-semibold text-on-surface leading-snug">{q.question}</p>
          </div>
        ))}
      </div>

      {/* Recording controls */}
      <div className="elevo-card elevo-card-border p-6 flex flex-col items-center gap-4 mt-2">
        {stage.type === "recording" ? (
          <>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-bold text-on-surface">Yozilmoqda...</span>
              <span className="text-sm font-black text-primary tabular-nums">
                {mins}:{String(secs).padStart(2, "0")}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-sm active:scale-95 transition-transform"
            >
              <MicOff className="w-4 h-4" />
              Tugatish
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-on-surface-variant text-center">
              Barcha 3 savolga ketma-ket javob bering. Maksimal vaqt: 3 daqiqa.
            </p>
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl elevo-btn-primary font-bold text-base active:scale-95 transition-transform"
            >
              <Mic className="w-5 h-5" />
              Recording boshlash
            </button>
          </>
        )}
      </div>
    </div>
  )
}
