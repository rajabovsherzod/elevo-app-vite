import { useEffect, useRef, useCallback } from "react"

interface UseAudioPlaybackOptions {
  onEnded?: () => void
  onError?: () => void
}

export function useAudioPlayback(src: string, { onEnded, onError }: UseAudioPlaybackOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const onEndedRef = useRef(onEnded)
  const onErrorRef = useRef(onError)

  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    const audio = new Audio(src)
    audioRef.current = audio

    audio.addEventListener("ended", () => onEndedRef.current?.())
    audio.addEventListener("error", () => onErrorRef.current?.())

    return () => {
      audio.pause()
      audio.src = ""
      audioRef.current = null
    }
  }, [src])

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => onErrorRef.current?.())
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  return { play, stop }
}
