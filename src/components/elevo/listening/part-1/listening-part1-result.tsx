import { useState, memo } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import type { ListeningPart1EvaluateResponse, ListeningPart1QuestionItem } from "@/lib/api/listening"
import { ListeningAudioPlayer, ListeningTranscriptCard, useAnimatedProgressBar } from "@/components/elevo/listening/shared"
import { AnswerCard } from "@/components/elevo/shared"
import { ExplanationModal } from "@/components/elevo/shared/explanation-modal"

// ── Memoized Answer Review Component ──────────────────────────────────────────
function AnswerReview({ results, questions }: {
  results: ListeningPart1EvaluateResponse["results"]
  questions: ListeningPart1QuestionItem[]
}) {
  const [modalPosition, setModalPosition] = useState<number | null>(null)
  const openItem = modalPosition !== null ? results[String(modalPosition)] : null

  return (
    <>
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {questions.map((q) => {
              const result = results[String(q.position)]
              if (!result) return null

              return (
                <AnswerCard
                  key={q.position}
                  position={q.position}
                  userAnswer={result.user_answer}
                  correctAnswer={result.correct_answer}
                  isCorrect={result.is_correct}
                  explanation_uz={result.explanation_uz}
                  explanation_en={result.explanation_en}
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

// ── Memoized Questions Accordion ──────────────────────────────────────────────
const QuestionsAccordion = memo(function QuestionsAccordion({
  questions,
  results
}: {
  questions: ListeningPart1QuestionItem[]
  results: ListeningPart1EvaluateResponse["results"]
}) {
  const [questionsOpen, setQuestionsOpen] = useState(false)

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Questions ({questions.length})
        </p>
      </div>
      <AccordionRow
        title="View Questions with Correct Answers"
        open={questionsOpen}
        onToggle={() => setQuestionsOpen(p => !p)}
        last
      >
        <div className="px-4 pb-4 pt-1 flex flex-col gap-4">
          {questions.map((q, i) => {
            const result = results[String(q.position)]
            const correctLetter = result?.correct_answer || ""

            return (
              <div key={q.position} className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 bg-indigo-500 text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-on-surface flex-1">
                    {q.question}
                  </p>
                </div>
                <div className="pl-9 flex flex-col gap-1.5">
                  {q.answers.map((a) => {
                    const isCorrect = a.letter === correctLetter
                    return (
                      <p key={a.letter} className="text-xs text-on-surface-variant">
                        <span className="font-bold text-on-surface">
                          {a.letter}.
                        </span>{" "}
                        {a.text}
                        {isCorrect && (
                          <span className="ml-2 px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 text-[10px] font-bold">
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
      </AccordionRow>
    </div>
  )
})

// ── AccordionRow Helper Component ─────────────────────────────────────────────
function AccordionRow({
  title,
  open,
  onToggle,
  last = false,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={last ? "" : "border-b border-surface-container-high"}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">{title}</span>
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
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  result:    ListeningPart1EvaluateResponse
  questions: ListeningPart1QuestionItem[]
  audioUrl:  string | null
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart1Result({ result, questions, audioUrl }: Props) {
  const scorePercent = Math.round(result.summary.score_percent)
  const isGood       = scorePercent >= 70
  const barRef       = useAnimatedProgressBar(scorePercent)

  const transcript = result.transcript

  return (
    <div className="flex flex-col gap-4 animate-fade-in">

      {/* ── Score card ── */}
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

      {/* ── Answer review ── */}
      <AnswerReview results={result.results} questions={questions} />

      {/* ── Audio player ── */}
      {audioUrl && (
        <div className="elevo-card elevo-card-border p-4" style={{ contain: 'layout style paint' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
            Exam Audio
          </p>
          <ListeningAudioPlayer src={audioUrl} />
        </div>
      )}

      {/* ── Transcript card ── */}
      {transcript && <ListeningTranscriptCard transcript={transcript} />}

      {/* ── Questions accordion ── */}
      <QuestionsAccordion questions={questions} results={result.results} />
    </div>
  )
}
