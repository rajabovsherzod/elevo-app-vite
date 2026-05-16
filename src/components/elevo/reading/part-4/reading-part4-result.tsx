import { useState } from "react"
import { AnswerCard, useAnimatedProgressBar } from "@/components/elevo/shared"
import { ExplanationModal } from "@/components/elevo/shared/explanation-modal"
import type {
  ReadingPart4EvaluateResponse,
  ReadingPart4Question,
} from "@/lib/api/reading"

interface Props {
  result: ReadingPart4EvaluateResponse
  questions: ReadingPart4Question[]
}

export function ReadingPart4Result({ result, questions }: Props) {
  const scorePercent = Math.round(result.summary.score_percent)
  const isGood = scorePercent >= 70
  const barRef = useAnimatedProgressBar(scorePercent)

  // Explanation modal state
  const [selectedExplanation, setSelectedExplanation] = useState<{
    position: number
    correctAnswer: string
    uz: string | null | undefined
    en: string | null | undefined
  } | null>(null)


  return (
    <div className="flex flex-col gap-4 animate-fade-in">

      {/* Score card */}
      <div className="elevo-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
              Your Score
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {result.summary.correct_count} / {result.summary.total} correct
            </p>
            {result.summary.total - result.summary.correct_count > 0 && (
              <p className="text-xs text-on-surface-variant mt-1">
                {result.summary.total - result.summary.correct_count} incorrect
              </p>
            )}
          </div>
          <span className={`text-4xl font-black tabular-nums ${isGood ? "text-primary" : "text-error"}`}>
            {scorePercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            ref={barRef}
            className={`h-full rounded-full ${isGood ? "bg-primary" : "bg-error"}`}
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Answer review - Using shared AnswerCard */}
      <div className="elevo-card overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>

        {/* Desktop: 3 columns, Mobile: 2 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
          {Object.entries(result.results).map(([position, res]) => {
            const question = questions.find((q) => q.position === parseInt(position))
            const pos = parseInt(position)
            
            // For questions 1-4 (MCQ): show only letter (A, B, C, D)
            // For questions 5-9 (T/F/NG): show full text (TRUE/FALSE/NOT GIVEN)
            const isTFNG = pos >= 5
            const userAnswerDisplay = isTFNG 
              ? (question?.answers.find(a => a.letter === res.user_answer)?.text || res.user_answer)
              : res.user_answer
            const correctAnswerDisplay = isTFNG
              ? (question?.answers.find(a => a.letter === res.correct_answer)?.text || res.correct_answer)
              : res.correct_answer

            return (
              <AnswerCard
                key={position}
                position={parseInt(position)}
                isCorrect={res.is_correct}
                userAnswer={userAnswerDisplay}
                correctAnswer={correctAnswerDisplay}
                explanation_uz={res.explanation_uz}
                explanation_en={res.explanation_en}
                onExplanationClick={() => setSelectedExplanation({
                  position: parseInt(position),
                  correctAnswer: correctAnswerDisplay,
                  uz: res.explanation_uz,
                  en: res.explanation_en
                })}
              />
            )
          })}
        </div>
      </div>

      {/* Explanation Modal */}
      {selectedExplanation && (
        <ExplanationModal
          isOpen={!!selectedExplanation}
          onClose={() => setSelectedExplanation(null)}
          position={selectedExplanation.position}
          correctAnswer={selectedExplanation.correctAnswer}
          explanation_uz={selectedExplanation.uz}
          explanation_en={selectedExplanation.en}
        />
      )}
    </div>
  )
}
