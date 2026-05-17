import { useRef, useCallback, useMemo } from "react"

// Reliable dimension helper — getBoundingClientRect can return 0 on iOS
// WKWebView's first layout pass. offsetWidth/Height are integers and
// reflect the rendered box reliably even before getBoundingClientRect settles.
function canvasDimensions(canvas: HTMLCanvasElement): { w: number; h: number } {
  const w = canvas.offsetWidth  || canvas.getBoundingClientRect().width  || 0
  const h = canvas.offsetHeight || canvas.getBoundingClientRect().height || 0
  return { w, h }
}

export function useAudioVisualizer() {
  const ctxRef     = useRef<AudioContext | null>(null)
  const animRef    = useRef<number | undefined>(undefined)
  const analyserRef= useRef<AnalyserNode | null>(null)

  // Call during a user-gesture (e.g. button tap on intro) to unlock AudioContext on iOS.
  // On iOS, AudioContext.resume() is only honored when called synchronously inside
  // a user-gesture handler (touchstart / click). Calling it from audio.onended or
  // setTimeout will be silently ignored by Safari.
  const unlock = useCallback(() => {
    if (!ctxRef.current) {
      try { ctxRef.current = new AudioContext() } catch { return }
    }
    const ctx = ctxRef.current
    if (ctx.state === "suspended") {
      // Play a silent 1-sample buffer — this is the iOS AudioContext unlock trick
      // that works even without an explicit user gesture if the user has previously
      // interacted with the page.
      try {
        const buf = ctx.createBuffer(1, 1, 22050)
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.connect(ctx.destination)
        src.start(0)
      } catch { /* ignore */ }
      ctx.resume().catch(() => {})
    }
  }, [])

  // Start visualizing. Strategy:
  //   1. Always start the mock (sine-wave) animation immediately — user sees
  //      something on ALL platforms including iOS where AudioContext may stay suspended.
  //   2. In parallel, try to resume AudioContext and upgrade to real mic data.
  //      On Android/desktop this typically succeeds within a frame.
  //      On iOS it only works if the context was already unlocked via a prior
  //      user gesture; if not, the mock stays — still looks good.
  const start = useCallback((stream: MediaStream, canvas: HTMLCanvasElement) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)

    // Mock starts immediately — no AudioContext needed, always animates.
    drawMock(canvas)

    // Try to attach real analyser (AudioContext must be "running")
    const tryReal = () => {
      const ctx = ctxRef.current
      if (!ctx || ctx.state !== "running") return false
      try {
        if (animRef.current) cancelAnimationFrame(animRef.current)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8
        ctx.createMediaStreamSource(stream).connect(analyser)
        analyserRef.current = analyser
        drawReal(analyser, canvas)
        return true
      } catch {
        return false
      }
    }

    if (tryReal()) return // Already running (Android/desktop common path)

    // AudioContext suspended — attempt resume and upgrade once resolved.
    // On iOS this may never resolve if no user gesture occurred; that's fine,
    // the mock keeps running.
    const ctx = ctxRef.current
    if (ctx && ctx.state === "suspended") {
      ctx.resume()
        .then(() => { tryReal() })
        .catch(() => {})
    }
  }, [])

  const stop = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = undefined }
    analyserRef.current = null
  }, [])

  const destroy = useCallback(() => {
    stop()
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
  }, [stop])

  // ── drawReal: real microphone frequency data ──────────────────────────────
  const drawReal = (analyser: AnalyserNode, canvas: HTMLCanvasElement) => {
    const ctx2d = canvas.getContext("2d")
    if (!ctx2d) { drawMock(canvas); return }

    const { w, h } = canvasDimensions(canvas)
    if (w === 0 || h === 0) {
      animRef.current = requestAnimationFrame(() => drawReal(analyser, canvas))
      return
    }

    const dpr = window.devicePixelRatio || 1
    canvas.width  = w * dpr
    canvas.height = h * dpr
    ctx2d.scale(dpr, dpr)

    const bufLen   = analyser.frequencyBinCount
    const data     = new Uint8Array(bufLen)
    const barCount = 52
    const slotW    = w / barCount
    const bw       = slotW * 0.32
    const gap      = slotW * 0.68
    const cy       = h / 2

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(data)
      ctx2d.clearRect(0, 0, w, h)
      let x = gap / 2
      for (let i = 0; i < barCount; i++) {
        const idx = Math.floor((i / barCount) * bufLen * 0.35)
        const v   = data[idx] || 0
        const barH = Math.max(2.5, Math.pow(v / 255, 1.4) * h * 0.82)
        ctx2d.beginPath()
        ctx2d.roundRect?.(x, cy - barH / 2, bw, barH, bw / 2) ?? ctx2d.rect(x, cy - barH / 2, bw, barH)
        ctx2d.fillStyle = `rgba(99,102,241,${0.25 + (v / 255) * 0.75})`
        ctx2d.fill()
        x += slotW
      }
    }
    draw()
  }

  // ── drawMock: animated sine-wave fallback (no AudioContext needed) ────────
  const drawMock = (canvas: HTMLCanvasElement) => {
    const ctx2d = canvas.getContext("2d")
    if (!ctx2d) return

    const { w, h } = canvasDimensions(canvas)
    if (w === 0 || h === 0) {
      animRef.current = requestAnimationFrame(() => drawMock(canvas))
      return
    }

    const dpr = window.devicePixelRatio || 1
    canvas.width  = w * dpr
    canvas.height = h * dpr
    ctx2d.scale(dpr, dpr)

    const barCount = 52
    const slotW    = w / barCount
    const bw       = slotW * 0.32
    const gap      = slotW * 0.68
    const cy       = h / 2
    let frame = 0

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      ctx2d.clearRect(0, 0, w, h)
      let x = gap / 2
      for (let i = 0; i < barCount; i++) {
        const barH = Math.max(2.5, Math.abs(Math.sin((i + frame) * 0.18)) * h * 0.55)
        ctx2d.beginPath()
        ctx2d.roundRect?.(x, cy - barH / 2, bw, barH, bw / 2) ?? ctx2d.rect(x, cy - barH / 2, bw, barH)
        ctx2d.fillStyle = "rgba(99,102,241,0.28)"
        ctx2d.fill()
        x += slotW
      }
      frame += 0.4
    }
    draw()
  }

  // Stable reference — prevents downstream useEffects from re-running every render
  return useMemo(() => ({ unlock, start, stop, destroy }), [unlock, start, stop, destroy])
}
