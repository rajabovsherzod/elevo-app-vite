import { ErrorCard } from "@/components/elevo/shared/error-card"
import { type AppError } from "@/lib/types/errors"

interface ListeningErrorProps {
  title?: string
  error: AppError
  onRetry: () => void
  onBack?: () => void
}

export function ListeningError({ error, onRetry, onBack }: ListeningErrorProps) {
  return <ErrorCard error={error} onRetry={onRetry} onBack={onBack} />
}
