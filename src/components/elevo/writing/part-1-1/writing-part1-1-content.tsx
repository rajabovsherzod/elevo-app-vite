import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { WritingPart1_1Editor } from "./writing-part1-1-editor"
import { WritingPart1_1Result } from "./writing-part1-1-result"
import { useWritingPart1_1 } from "./use-writing-part1-1"

export function WritingPart1_1Content() {
  const {
    phase, task, text, result, error,
    wordCount, canSubmit,
    setText, submit, retry,
  } = useWritingPart1_1()

  if (phase === "loading") {
    return <ExamLoading />
  }

  if (phase === "error" && error) {
    return <ErrorCard error={error} onRetry={retry} />
  }

  if (phase === "submitting") {
    return <CalculatingResults />
  }

  if (phase === "result" && result) {
    return <WritingPart1_1Result response={result} onRetry={retry} />
  }

  if (!task) return null

  return (
    <WritingPart1_1Editor
      task={task}
      text={text}
      wordCount={wordCount}
      canSubmit={canSubmit}
      isLocked={false}
      onTextChange={setText}
      onSubmit={submit}
    />
  )
}
