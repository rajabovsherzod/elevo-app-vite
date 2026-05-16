import { useRef, useEffect } from "react"

export function useAnimatedProgressBar(scorePercent: number) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = barRef.current
    if (!el) return

    // Reset to 0% synchronously — no reflow, just a style write
    el.style.transition = "none"
    el.style.width = "0%"

    // Double RAF: first frame lets the browser see the 0% state,
    // second frame starts the animation. No getBoundingClientRect()
    // forced-reflow which would interrupt ongoing CSS animations (e.g. fade-in).
    let raf2: number
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        el.style.transition = "width 1s cubic-bezier(0.34,1.2,0.64,1)"
        el.style.width = `${scorePercent}%`
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [scorePercent])

  return barRef
}
