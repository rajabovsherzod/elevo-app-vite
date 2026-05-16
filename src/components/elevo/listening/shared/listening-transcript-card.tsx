import { memo, useState } from "react"
import { ChevronDown, ChevronUp, FileText } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"

interface Props {
  transcript: string
}

export const ListeningTranscriptCard = memo(function ListeningTranscriptCard({ transcript }: Props) {
  const [open, setOpen] = useState(true)
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10 flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary flex-1">
          Transcript
        </p>
        <span className="text-[10px] font-bold text-primary/60 tabular-nums">
          {wordCount} words
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">
          {open ? "Hide transcript" : "View audio transcript"}
        </span>
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
            <div className="px-4 pb-4 pt-1">
              <div
                className="rounded-xl p-4 max-h-72 overflow-y-auto"
                style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}
              >
                <p className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
