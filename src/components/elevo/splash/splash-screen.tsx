import type { BootPhase } from "@/providers/splash-provider";

// ── Brand ────────────────────────────────────────────────────────────
const PRIMARY     = "#4F46E5";
const PRIMARY_ALT = "rgba(79, 70, 229, 0.16)";

// ── Wordmark: two words, letter-by-letter (inventrix-style) ──────────
const WORD1 = "Elevo".split("");
const WORD2 = "Multilevel Preparation".split("");

// ── Animation delays (seconds) ───────────────────────────────────────
const SMALL_CHEVRON_DELAY = 0.08;
const LARGE_CHEVRON_DELAY = 0.22;
const WORD1_START         = 0.42;
const WORD2_START         = WORD1_START + WORD1.length * 0.05 + 0.06;
const DOTS_APPEAR_DELAY   = WORD2_START + WORD2.length * 0.025 + 0.08;

interface SplashScreenProps {
  phase: BootPhase;
  exiting: boolean;
}

export function SplashScreen({ exiting }: SplashScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: "var(--el-background, #f8fafc)",
        animation: exiting ? "splash-exit 0.42s cubic-bezier(0.4,0,1,1) forwards" : undefined,
      }}
    >
      {/* ── Soft ambient glow behind logo ────────────────────────── */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 120, height: 120,
          borderRadius: "50%",
          background: PRIMARY_ALT,
          filter: "blur(28px)",
          animation: "splash-glow 0.6s ease forwards",
          opacity: 0,
        }}
      />

      {/* ── Brand SVG — two chevrons draw sequentially ───────────── */}
      <svg
        width="96" height="96"
        viewBox="0 0 48 48"
        fill="none"
        style={{ position: "relative", marginBottom: 28 }}
      >
        {/* Small chevron — draws first, stays at 55% opacity */}
        <path
          d="M6.87054 26.7399C7.92168 29.0424 11.1761 29.0886 12.2922 26.8169L18.676 13.8228C19.6553 11.8294 18.2044 9.5 15.9834 9.5L3.66755 9.5C1.48356 9.5 0.0314944 11.7591 0.938489 13.7459L6.87054 26.7399Z"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          strokeWidth="0.6"
          style={{
            fill: PRIMARY,
            fillOpacity: 0,
            stroke: PRIMARY,
            opacity: 0.55,
            animation: `splash-draw 1.1s cubic-bezier(0.4,0,0.2,1) forwards ${SMALL_CHEVRON_DELAY}s`,
          }}
        />
        {/* Large chevron — draws after, full opacity */}
        <path
          d="M35.8177 36.8043C35.3172 37.8411 34.2674 38.5 33.1161 38.5H16.8085C14.5892 38.5 13.1382 36.1739 14.1141 34.1807L25.3765 11.1807C25.8802 10.1521 26.9256 9.5 28.0709 9.5L44.2195 9.5C46.4315 9.5 47.8828 11.8122 46.9212 13.8042L35.8177 36.8043Z"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          strokeWidth="0.6"
          style={{
            fill: PRIMARY,
            fillOpacity: 0,
            stroke: PRIMARY,
            animation: `splash-draw 1.1s cubic-bezier(0.4,0,0.2,1) forwards ${LARGE_CHEVRON_DELAY}s`,
          }}
        />
      </svg>

      {/* ── Wordmark — "Elevo" + "Multilevel Preparation" ─────────── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        {/* Word 1 — "Elevo" (large, primary text) */}
        <div style={{ display: "flex" }}>
          {WORD1.map((letter, i) => (
            <span
              key={i}
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: "var(--el-on-surface, #1a1a2e)",
                opacity: 0,
                display: "inline-block",
                animation: `splash-letter 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards ${WORD1_START + i * 0.05}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Word 2 — "Multilevel Preparation" (smaller, brand color) */}
        <div style={{ display: "flex" }}>
          {WORD2.map((letter, i) => (
            <span
              key={i}
              style={{
                fontSize: letter === " " ? 6 : 16,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1,
                color: PRIMARY,
                opacity: 0,
                display: "inline-block",
                animation: `splash-letter 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards ${WORD2_START + i * 0.025}s`,
              }}
            >
              {letter === " " ? " " : letter}
            </span>
          ))}
        </div>
      </div>

      {/* ── 3-dot loader ─────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          display: "flex",
          gap: 6,
          opacity: 0,
          animation: `splash-tagline 0.4s ease forwards ${DOTS_APPEAR_DELAY}s`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 5, height: 5,
              borderRadius: "50%",
              background: PRIMARY,
              display: "inline-block",
              animation: `splash-dot 1.2s ease-in-out infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
