import { useEffect, useRef } from "react"
import lottie, { AnimationItem } from "lottie-web"

const STEPS = [
  "Analysing your answers...",
  "Checking accuracy...",
  "Calculating score...",
]

export function CalculatingResults() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Load animation using lottie-web (works perfectly with Vite)
    import("../../../assets/exam-loading.json").then((animationData) => {
      if (containerRef.current && !animationRef.current) {
        animationRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: animationData.default || animationData,
        })
      }
    })

    return () => {
      animationRef.current?.destroy()
      animationRef.current = null
    }
  }, [])

  return (
    <div className="elevo-card elevo-card-border w-full min-h-[55vh] flex flex-col items-center justify-center gap-5 p-8">
      <div ref={containerRef} className="w-36 h-36" />

      <div className="flex flex-col items-center gap-1 -mt-2">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-on-surface">
          Calculating Results
        </p>
        <div className="flex items-center gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{
                animation: `calculating-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mt-1">
        {STEPS.map((step, i) => (
          <p
            key={step}
            className="text-xs text-on-surface-variant font-medium"
            style={{
              animation: `calculating-fade 2.4s ease-in-out ${i * 0.8}s infinite`,
              opacity: 0,
            }}
          >
            {step}
          </p>
        ))}
      </div>
    </div>
  )
}
