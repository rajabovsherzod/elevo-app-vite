import { useRef, useCallback } from "react"

function getMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm"
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const candidates = isIOS
    ? ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"]
    : ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", "audio/mp4"]
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ""
}

function mimeToExt(mime: string): string {
  if (mime.includes("mp4")) return "mp4"
  if (mime.includes("ogg")) return "ogg"
  return "webm"
}

interface RecordOptions {
  stream: MediaStream
  maxSeconds: number
  questionIndex: number
}

// Chunk every 250ms — small enough that even on iOS-mp4 (where chunks
// arrive only at stop) we still get the full data, AND on Chrome/Firefox
// it embeds proper duration metadata into the WebM file (needed for
// backend STT to decode the FULL clip, not just the first N seconds).
const TIMESLICE_MS = 250

// After recorder.stop(), some browsers fire `ondataavailable` AFTER
// `onstop` (technically a spec violation but observed in the wild).
// Wait this long for any late chunk before finalizing.
const POST_STOP_GRACE_MS = 250

export function useMicRecorder() {
  const stopRef = useRef<(() => void) | null>(null)

  const recordOnce = useCallback((opts: RecordOptions): Promise<File> => {
    return new Promise((resolve, reject) => {
      const { stream, maxSeconds, questionIndex } = opts

      // Abort any previous recording (safety, should never trigger in normal flow)
      if (stopRef.current) {
        stopRef.current()
        stopRef.current = null
      }

      const mimeType = getMimeType()
      let recorder: MediaRecorder
      try {
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream)
      } catch {
        reject(new Error("MediaRecorder yaratishda xatolik"))
        return
      }

      const chunks: Blob[] = []
      let resolved = false
      let maxTimer: ReturnType<typeof setTimeout> | null = null
      let graceTimer: ReturnType<typeof setTimeout> | null = null

      const buildFile = (): File => {
        const actualMime = recorder.mimeType || mimeType || "audio/webm"
        const ext = mimeToExt(actualMime)
        const blob = new Blob(chunks, { type: actualMime })
        return new File([blob], `audio_${questionIndex + 1}.${ext}`, { type: actualMime })
      }

      const finalize = () => {
        if (resolved) return
        resolved = true
        if (maxTimer) { clearTimeout(maxTimer); maxTimer = null }
        if (graceTimer) { clearTimeout(graceTimer); graceTimer = null }
        stopRef.current = null
        resolve(buildFile())
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = () => {
        // Wait briefly for any final `ondataavailable` that may fire AFTER onstop
        // on certain browsers. If it arrives during the grace window, chunks
        // will be updated before finalize() builds the blob.
        if (graceTimer) clearTimeout(graceTimer)
        graceTimer = setTimeout(finalize, POST_STOP_GRACE_MS)
      }

      recorder.onerror = () => {
        if (resolved) return
        resolved = true
        if (maxTimer) { clearTimeout(maxTimer); maxTimer = null }
        if (graceTimer) { clearTimeout(graceTimer); graceTimer = null }
        stopRef.current = null
        reject(new Error("MediaRecorder xatosi"))
      }

      const doStop = () => {
        if (recorder.state === "recording" || recorder.state === "paused") {
          // Force-flush any buffered data before stop
          try { recorder.requestData() } catch { /* not supported, ignore */ }
          try { recorder.stop() } catch { finalize() }
        } else {
          // Already inactive — just finalize whatever we have
          finalize()
        }
      }

      stopRef.current = doStop

      // Start with timeslice so:
      // - Chrome/Firefox embed proper duration in WebM → backend decodes full clip
      // - We have data in `chunks` progressively (resilient to lost final chunk)
      // - iOS Safari ignores timeslice but still works on stop
      try {
        recorder.start(TIMESLICE_MS)
      } catch {
        // Some older browsers don't accept timeslice — fall back
        try { recorder.start() }
        catch {
          reject(new Error("MediaRecorder ishga tushmadi"))
          return
        }
      }

      maxTimer = setTimeout(doStop, maxSeconds * 1000)
    })
  }, [])

  const stopCurrent = useCallback(() => {
    if (stopRef.current) {
      stopRef.current()
      stopRef.current = null
    }
  }, [])

  return { recordOnce, stopCurrent }
}
