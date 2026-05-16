import { useEffect, useRef } from "react"
import lottie, { AnimationItem } from "lottie-web"
import { getLoadingAriaLabel } from "@/lib/utils/a11y"

export function ExamLoading() {
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
    <div
      className="elevo-card elevo-card-border w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8"
      role="status"
      aria-live="polite"
      aria-label={getLoadingAriaLabel("exam")}
    >
      <div 
        ref={containerRef} 
        className="relative w-40 h-40" 
        aria-hidden="true"
      />

      <p className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant -mt-2">
        EXAM LOADING
      </p>
    </div>
  )
}
