import { memo } from "react"

interface ReadingPart5MainTextProps {
  title: string
  text: string
}

export const ReadingPart5MainText = memo(function ReadingPart5MainText({
  title,
  text,
}: ReadingPart5MainTextProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          {title || "Reading Text"}
        </p>
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-3">
          {text.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-on-surface">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
})
