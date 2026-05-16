import { useState, memo } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import type {
  ListeningPart5EvaluateResponseSimple,
  ListeningPart5QuestionsResponseSimple,
} from "@/lib/api/listening"
import { ListeningAudioPlayer, ListeningTranscriptCard, useAnimatedProgressBar } from "@/components/elevo/listening/shared"
import { AnswerCard } from "@/components/elevo/shared/answer-card"
import { ExplanationModal } from "@/components/elevo/shared/explanation-modal"

// ── Answer Review Grid ────────────────────────────────────────────────────────
function AnswerReview({
  results,
  extracts,
}: {
  results: ListeningPart5EvaluateResponseSimple["results"]
  extracts: ListeningPart5QuestionsResponseSimple["extracts"]
}) {
  const [modalPosition, setModalPosition] = useState<number | null>(null)
  const openItem = modalPosition !== null ? results[String(modalPosition)] : null
  const allQuestions = extracts.flatMap(ext => ext.questions)

  return (
    <>
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {allQuestions.map((q) => {
              const positionKey = String(q.position)
              const resultItem = results[positionKey]
              if (!resultItem) return null

              return (
                <AnswerCard
                  key={q.position}
                  position={q.position}
                  isCorrect={resultItem.is_correct}
                  userAnswer={resultItem.user_answer}
                  correctAnswer={resultItem.correct_answer}
                  explanation_uz={resultItem.explanation_uz}
                  explanation_en={resultItem.explanation_en}
                  onExplanationClick={() => setModalPosition(q.position)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {openItem && modalPosition !== null && (
        <ExplanationModal
          isOpen
          onClose={() => setModalPosition(null)}
          position={modalPosition}
          correctAnswer={openItem.correct_answer}
          explanation_uz={openItem.explanation_uz}
          explanation_en={openItem.explanation_en}
        />
      )}
    </>
  )
}

// ── Questions Accordion ───────────────────────────────────────────────────────
const QuestionsAccordion = memo(function QuestionsAccordion({
  extracts,
  results,
}: {
  extracts: ListeningPart5QuestionsResponseSimple["extracts"]
  results: ListeningPart5EvaluateResponseSimple["results"]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Questions & Correct Answers
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">View all questions with correct answers</span>
        {open
          ? <ChevronUp   className="w-4 h-4 text-on-surface-variant" />
          : <ChevronDown className="w-4 h-4 text-on-surface-variant" />
        }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 flex flex-col gap-5">
              {extracts.map((extract) => (
                <div key={extract.extract_number}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-on-surface whitespace-nowrap">
                        Extract {extract.extract_number}
                      </p>
                      <div className="flex-1 border-t-2 border-dashed border-outline-variant/60" />
                    </div>

                    {extract.questions.map((q) => {
                      const positionKey = String(q.position)
                      const resultItem = results[positionKey]
                      const correctLetter = resultItem?.correct_answer || ""

                      return (
                        <div key={q.position} className="flex flex-col gap-2 pl-4">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                              {q.position}
                            </span>
                            <p className="text-sm font-semibold text-on-surface flex-1">
                              {q.question}
                            </p>
                          </div>

                          <div className="pl-8 flex flex-col gap-1.5">
                            {q.answers.map((a) => {
                              const isCorrect = a.letter === correctLetter
                              return (
                                <p key={a.letter} className="text-xs text-on-surface-variant">
                                  <span className="font-bold text-on-surface">
                                    {a.letter}.
                                  </span>{" "}
                                  {a.text}
                                  {isCorrect && (
                                    <span className="ml-2 text-green-600 text-[10px] font-bold">
                                      Correct
                                    </span>
                                  )}
                                </p>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  result:   ListeningPart5EvaluateResponseSimple
  question: ListeningPart5QuestionsResponseSimple
  answers:  Record<number, string>
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart5Result({ result, question, answers }: Props) {
  const scorePercent = Math.round(result.summary.score_percent)
  const isGood       = scorePercent >= 70
  const barRef       = useAnimatedProgressBar(scorePercent)

  const audioUrl = result.question.audio_url || question.audio_url
  const transcript = result.transcript

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

      {/* Answer review */}
      <AnswerReview results={result.results} extracts={question.extracts} />

      {/* Audio player */}
      {audioUrl && (
        <div className="elevo-card elevo-card-border p-4" style={{ contain: "layout style paint" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
            Exam Audio
          </p>
          <ListeningAudioPlayer src={audioUrl} />
        </div>
      )}

      {/* Transcript card */}
      {transcript && <ListeningTranscriptCard transcript={transcript} />}

      {/* Questions accordion */}
      <QuestionsAccordion extracts={question.extracts} results={result.results} />
    </div>
  )
}
