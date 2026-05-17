import { useEffect, useRef } from "react"
import lottie, { AnimationItem } from "lottie-web"

const STEPS = [
  "Ovozingiz tahlil qilinmoqda...",
  "Grammatika tekshirilmoqda...",
  "Ball hisoblanmoqda...",
]

export function Part1_1Calculating() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    import("../../../../assets/exam-loading.json").then((data) => {
      if (containerRef.current && !animationRef.current) {
        animationRef.current = lottie.loadAnimation({
          container: containerRef.current!,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: data.default || data,
        })
      }
    })
    return () => {
      animationRef.current?.destroy()
      animationRef.current = null
    }
  }, [])

  return (
    <div className="elevo-card elevo-card-border w-full flex flex-col items-center justify-center gap-5 py-12 px-6 animate-fade-in">
      {/* Lottie */}
      <div ref={containerRef} className="w-28 h-28" />

      {/* Main text */}
      <div className="flex flex-col items-center gap-1.5 -mt-2 text-center">
        <p className="text-[13px] font-black uppercase tracking-[0.18em] text-on-surface">
          AI baholamoqda
        </p>
        <p className="text-xs text-on-surface-variant/80">
          3 ta javobingiz tahlil qilinmoqda
        </p>

        {/* Dot loader */}
        <div className="flex items-center gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/50"
              style={{ animation: `calc-dot 1.2s ease-in-out ${i * 0.22}s infinite` }}
            />
          ))}
        </div>
      </div>

      {/* Step hints */}
      <div className="flex flex-col items-center gap-1.5 mt-1">
        {STEPS.map((step, i) => (
          <p
            key={step}
            className="text-[11px] text-on-surface-variant/50 font-medium"
            style={{
              animation: `calc-fade 3s ease-in-out ${i * 1}s infinite`,
              opacity: 0,
            }}
          >
            {step}
          </p>
        ))}
      </div>

      <p className="text-[11px] text-on-surface-variant/40 mt-1">
        20–40 soniya kutib turing
      </p>

      <style>{`
        @keyframes calc-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes calc-fade {
          0% { opacity: 0; transform: translateY(4px); }
          15% { opacity: 0.6; transform: translateY(0); }
          85% { opacity: 0.6; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
