import { Button } from "@/components/base/buttons/button"
import { CalculatingResults } from "@/components/elevo/shared"
import { ListeningAudioBar, ListeningInstruction, ListeningLoading, ListeningError, ListeningProgressBar } from "@/components/elevo/listening/shared"
import { ListeningPart6GapText } from "./listening-part6-gap-text"
import { ListeningPart6Result } from "./listening-part6-result"
import { useListeningPart6 } from "./use-listening-part6"
import { ErrorCode } from "@/lib/types/errors"

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart6Content({ examId }: { examId: number }) {
  const {
    phase,
    data,
    answers,
    result,
    isAudioPlaying,
    error,
    allFilled,
    filledCount,
    setAnswer,
    handleSubmit,
    retry,
  } = useListeningPart6(examId)

  if (phase === "loading") {
    return <ListeningLoading title="Part 6 — Gap Filling" />
  }

  if (phase === "error" && error) {
    return <ListeningError error={error} onRetry={retry} />
  }

  if (phase === "calculating") {
    return <CalculatingResults />
  }

  if (phase === "result" && result) {
    return <ListeningPart6Result result={result} />
  }

  if (!data) {
    return (
      <ListeningError
        error={{ 
          message: "No question available", 
          code: ErrorCode.NOT_FOUND,
          retry: true
        }}
        onRetry={retry}
      />
    )
  }

  const totalGaps = data.positions.length

  return (
    <div className="flex flex-col gap-4 pb-6">

      {/* Instruction */}
      <ListeningInstruction
        text={data.instruction ?? "You will hear a recording. Listen carefully and fill in the gaps with the missing words or phrases."}
      />

      {/* Audio status */}
      {(phase === "instruction" || phase === "question-audio") && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions audio" : "Question audio"}
        />
      )}

      {/* Gap fill text */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        {data.title && (
          <h2 className="text-sm font-bold text-on-surface">{data.title}</h2>
        )}

        <div
          className="rounded-xl p-4 elevo-card-border"
          style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}
        >
          <ListeningPart6GapText
            text={data.question ?? ""}
            positions={data.positions}
            answers={answers}
            onAnswerChange={setAnswer}
            disabled={phase === "instruction"}
            result={null}
          />
        </div>

        {totalGaps > 0 && (
          <ListeningProgressBar
            current={filledCount}
            total={totalGaps}
            label="ta bo'shliq"
          />
        )}
      </div>

      {(phase === "question-audio" || phase === "exam") && totalGaps > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            size="md"
            color="primary"
            isDisabled={!allFilled}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
