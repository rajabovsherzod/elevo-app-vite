import { memo, useState } from "react"
import { cx } from "@/utils/cx"
import type { ReadingPart3EvaluateResponse } from "@/lib/api/reading"
import { AnswerCard, useAnimatedProgressBar } from "@/components/elevo/shared"
import { ExplanationModal } from "@/components/elevo/shared/explanation-modal"

// ── Answer Review Grid (using shared AnswerCard) ─────────────────────────────
const AnswerReview = memo(function AnswerReview({
  results,
}: {
  results: ReadingPart3EvaluateResponse["results"]
}) {
  const [modalData, setModalData] = useState<{
    position: number
    correctAnswer: string
    explanation_uz?: string | null
    explanation_en?: string | null
  } | null>(null)

  // Convert results object to array for rendering
  const resultsArray = Object.entries(results).map(([position, detail]) => ({
    position: parseInt(position),
    ...detail
  }))

  return (
    <>
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>
        <div className="p-4">
          {/* Desktop: 3 columns, Mobile: 2 columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {resultsArray.map((item) => (
              <AnswerCard
                key={item.position}
                position={item.position}
                userAnswer={item.user_answer}
                correctAnswer={item.correct_answer}
                isCorrect={item.is_correct}
                explanation_uz={item.explanation_uz}
                explanation_en={item.explanation_en}
                onExplanationClick={() => setModalData({
                  position: item.position,
                  correctAnswer: item.correct_answer,
                  explanation_uz: item.explanation_uz,
                  explanation_en: item.explanation_en,
                })}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Explanation Modal - Shared Component */}
      {modalData && (
        <ExplanationModal
          isOpen={!!modalData}
          onClose={() => setModalData(null)}
          position={modalData.position}
          correctAnswer={modalData.correctAnswer}
          explanation_uz={modalData.explanation_uz}
          explanation_en={modalData.explanation_en}
        />
      )}
    </>
  )
})

// ── Props / Main ──────────────────────────────────────────────────────────────
interface Props {
  result: ReadingPart3EvaluateResponse
}

export function ReadingPart3Result({ result }: Props) {
  const scorePercent = Math.round(result.summary.score_percent)
  const isGood = scorePercent >= 70
  const barRef = useAnimatedProgressBar(scorePercent)

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Score card */}
      <div className="elevo-card elevo-card-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
              Your Score
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {result.summary.correct_count} / {result.summary.total} correct
            </p>
            {result.summary.total - result.summary.correct_count > 0 && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                {result.summary.total - result.summary.correct_count} incorrect
              </p>
            )}
          </div>
          <span className={cx("text-4xl font-black tabular-nums", isGood ? "text-primary" : "text-error")}>
            {scorePercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            ref={barRef}
            className={cx("h-full rounded-full", isGood ? "bg-primary" : "bg-error")}
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Answer review grid */}
      <AnswerReview results={result.results} />
    </div>
  )
}
