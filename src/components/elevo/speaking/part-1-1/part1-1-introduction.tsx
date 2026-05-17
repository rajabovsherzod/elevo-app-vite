import { useEffect, useRef } from "react"

interface Part1_1IntroductionProps {
  onComplete: () => void
}

export function Part1_1Introduction({ onComplete }: Part1_1IntroductionProps) {
  // Ref to always-fresh callback — no stale closure
  const cbRef = useRef(onComplete)
  useEffect(() => { cbRef.current = onComplete }, [onComplete])

  useEffect(() => {
    // Guard: prevent double-fire (StrictMode, etc.)
    let fired = false
    const advance = () => {
      if (fired) return
      fired = true
      cbRef.current()
    }

    const audio = new Audio("/speaking-sounds/introduction-speaking-part-1.1.mp3")

    // Advance when audio naturally ends
    audio.addEventListener("ended", advance)

    // If audio can't load at all — advance after 2s so user isn't stuck
    audio.addEventListener("error", () => setTimeout(advance, 2000))

    // Hard ceiling: max 20s no matter what
    const ceiling = setTimeout(advance, 20_000)

    // Try to play; if browser blocks autoplay — advance after 2s
    audio.play().catch(() => setTimeout(advance, 2000))

    return () => {
      // Mark as fired so any pending callbacks do nothing after unmount
      fired = true
      clearTimeout(ceiling)
      audio.pause()
      // Remove listeners BEFORE clearing src to avoid spurious error events
      audio.removeEventListener("ended", advance)
      audio.removeEventListener("error", advance)
      // Small delay before clearing src prevents abort→error→advance on cleanup
      setTimeout(() => { audio.src = "" }, 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="elevo-card elevo-card-border p-6 flex flex-col gap-5">

        {/* Pulse icon */}
        <div className="flex justify-center pt-1">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-16 h-16 rounded-full bg-primary/8 animate-ping opacity-40" />
            <span className="relative w-14 h-14 rounded-full bg-primary/12 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 block mb-1.5">
            Speaking Part 1.1
          </span>
          <h2 className="text-[18px] font-bold text-on-surface">Personal Questions</h2>
          <p className="text-sm text-on-surface-variant/70 mt-1">
            You will be asked 3 personal questions
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2">
          {[
            "You will be asked 3 independent questions",
            "You have 5 seconds to prepare each answer",
            "After the signal, speak for up to 30 seconds",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container-low">
              <span className="w-6 h-6 rounded-full bg-primary/12 flex items-center justify-center shrink-0 text-[11px] font-black text-primary">
                {i + 1}
              </span>
              <p className="text-[13px] text-on-surface-variant">{text}</p>
            </div>
          ))}
        </div>

        {/* Audio playing indicator */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {[3, 5, 7, 9, 7, 5, 3].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-primary/60"
              style={{
                height: `${h}px`,
                animation: `intro-bar 0.9s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
          <span className="text-[12px] text-on-surface-variant/50 ml-2">Playing audio...</span>
        </div>
      </div>

      <style>{`
        @keyframes intro-bar {
          from { transform: scaleY(0.3); opacity: 0.4; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
