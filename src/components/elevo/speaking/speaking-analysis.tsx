import { useState, useEffect, useRef } from "react"
import {
  CheckCircle2, TrendingUp, BookOpen, Layers, Volume2,
  Zap, Clock, Hash, Wind, FileText, Sparkles, ChevronRight,
} from "@/lib/icons"
import type { SpeakingEvaluateResponse } from "@/schemas/speaking.schema"

interface SpeakingAnalysisProps {
  results: SpeakingEvaluateResponse[]
  onFinish: () => void
}

/* ── CEFR ──────────────────────────────────────────────────────── */
const CEFR_META: Record<string, { color: string; bg: string; label: string }> = {
  "B1_Below":  { color: "#f43f5e", bg: "rgba(244,63,94,0.08)",  label: "B1 dan past" },
  "Below B1":  { color: "#f43f5e", bg: "rgba(244,63,94,0.08)",  label: "B1 dan past" },
  B1:          { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", label: "B1 Daraja" },
  B2:          { color: "#6366f1", bg: "rgba(99,102,241,0.08)", label: "B2 Daraja" },
  C1:          { color: "#10b981", bg: "rgba(16,185,129,0.08)", label: "C1 Daraja" },
}
const getCefr = (k: string) => CEFR_META[k] ?? CEFR_META["B1"]

/* ── Transcript parser: "[Answer 1] text [Answer 2] text" ─────── */
function parseAnswers(text: string): { n: number; body: string }[] {
  const parts = text.split(/\[Answer\s*(\d+)\]/i)
  const out: { n: number; body: string }[] = []
  for (let i = 1; i < parts.length; i += 2) {
    const body = (parts[i + 1] ?? "").trim()
    if (body) out.push({ n: parseInt(parts[i]), body })
  }
  return out.length ? out : [{ n: 1, body: text.trim() }]
}

/* ── Mini Skill Bar (hero card) ────────────────────────────────── */
function MiniSkillBar({ label, value, max = 8, color }: {
  label: string; value: number; max?: number; color: string
}) {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = "none"; el.style.width = "0%"
    el.getBoundingClientRect()
    el.style.transition = "width 1.1s cubic-bezier(0.34,1.1,0.64,1)"
    el.style.width = `${(value / max) * 100}%`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] font-semibold text-on-surface-variant/70 w-[62px] shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-[5px] rounded-full bg-surface-container-high overflow-hidden">
        <div ref={barRef} className="h-full rounded-full" style={{ width: "0%", background: color }} />
      </div>
      <span className="text-[12px] font-black text-on-surface tabular-nums w-5 text-right shrink-0">
        {value}
      </span>
    </div>
  )
}

/* ── Skill Bar ─────────────────────────────────────────────────── */
function SkillBar({ label, icon: Icon, value, max = 8 }: {
  label: string; icon: React.ElementType; value: number; max?: number
}) {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = "none"; el.style.width = "0%"
    el.getBoundingClientRect()
    el.style.transition = "width 1s cubic-bezier(0.34,1.2,0.64,1)"
    el.style.width = `${(value / max) * 100}%`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/8 border border-primary/12">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-on-surface">{label}</span>
          <span className="text-[13px] font-black text-primary tabular-nums">
            {value}<span className="text-on-surface-variant font-medium text-[11px]">/{max}</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div ref={barRef} className="h-full rounded-full bg-primary" style={{ width: "0%" }} />
        </div>
      </div>
    </div>
  )
}

/* ── Feedback Card — no left border, clean pill style ──────────── */
function FeedbackCard({ title, uz, en, color, icon: Icon }: {
  title: string; uz: string; en: string; color: string; icon: React.ElementType
}) {
  const [lang, setLang] = useState<"uz" | "en">("uz")
  const text = lang === "uz" ? uz || en : en || uz

  return (
    <div className="elevo-card elevo-card-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ background: `${color}14`, border: `1px solid ${color}22` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={2.5} />
          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color }}>
            {title}
          </span>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-outline-variant/30">
          {(["uz", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 text-[10px] font-black uppercase transition-colors ${
                lang === l
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant/50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[13px] text-on-surface leading-relaxed">{text}</p>
    </div>
  )
}

/* ── Stat Chip ─────────────────────────────────────────────────── */
function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="elevo-card elevo-card-border px-4 py-3 flex items-center gap-2.5">
      <Icon className="w-4 h-4 text-on-surface-variant/60 shrink-0" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 truncate">
          {label}
        </p>
        <p className="text-[15px] font-black text-on-surface leading-snug">{value}</p>
      </div>
    </div>
  )
}

/* ── Answer Transcript ─────────────────────────────────────────── */
function TranscriptSection({ transcript }: { transcript: string }) {
  const answers = parseAnswers(transcript)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1 mb-0.5">
        <FileText className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
        <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">
          Sizning javobingiz
        </span>
      </div>

      {answers.map(({ n, body }) => (
        <div key={n} className="elevo-card elevo-card-border p-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-black text-primary">
              {n}
            </span>
            <p className="text-[13px] text-on-surface leading-relaxed flex-1">{body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Improved Version Card — no accordion ──────────────────────── */
function ImprovedVersionCard({ level, text, rationale, color }: {
  level: string; text: string; rationale: string; color: string
}) {
  return (
    <div
      className="elevo-card elevo-card-border p-4"
      style={{ background: `${color}05` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5" style={{ color }} strokeWidth={2} />
        <span
          className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{ color, background: `${color}14`, border: `1px solid ${color}25` }}
        >
          {level} Darajasi
        </span>
      </div>

      <p className="text-[13px] text-on-surface leading-relaxed">{text}</p>

      {rationale && (
        <p className="mt-3 pt-3 border-t border-outline-variant/20 text-[11px] text-on-surface-variant/55 italic leading-relaxed">
          {rationale}
        </p>
      )}
    </div>
  )
}

/* ── Main ──────────────────────────────────────────────────────── */
export function SpeakingAnalysis({ results, onFinish }: SpeakingAnalysisProps) {
  const [activeTab, setActiveTab] = useState(0)
  if (!results.length) return null

  const current = results[activeTab]
  const r = current.result
  const m = current.metrics
  const cefr = getCefr(r.cefr)

  const verdict =
    r.total_32 >= 24 ? "Ajoyib natija!" :
    r.total_32 >= 16 ? "Yaxshi natija"  :
    "Ko'proq mashq kerak"

  const skills = [
    { label: "Ravonlik",   icon: Wind,     value: r.fluency       },
    { label: "Lug'at",     icon: BookOpen, value: r.vocabulary    },
    { label: "Grammatika", icon: Layers,   value: r.grammar       },
    { label: "Talaffuz",   icon: Volume2,  value: r.pronunciation },
  ]

  const speedVal    = m.speaking_speed_wpm ? `${Math.round(m.speaking_speed_wpm)} so'z/min` : "—"
  const durationVal = m.duration_seconds   ? `${Math.round(m.duration_seconds)}s`           : "—"

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in pb-8">

      {/* ── Hero card ────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[10px] font-black uppercase tracking-[0.16em] px-3 py-1.5 rounded-lg"
            style={{ color: cefr.color, background: `${cefr.color}14`, border: `1px solid ${cefr.color}28` }}
          >
            {cefr.label}
          </span>
          <span className="text-[12px] font-semibold text-on-surface-variant/60">{verdict}</span>
        </div>

        {/* Score + skill breakdown */}
        <div className="flex items-stretch gap-4">
          {/* Left — big score */}
          <div className="flex flex-col items-center justify-center shrink-0 w-[68px] gap-0.5">
            <span className="text-[52px] font-black leading-none tabular-nums text-on-surface select-none">
              {r.total_32}
            </span>
            <span className="text-[11px] font-semibold text-on-surface-variant/50 tracking-wide">
              / 32
            </span>
          </div>

          {/* Divider */}
          <div className="w-px bg-outline-variant/25 self-stretch shrink-0" />

          {/* Right — mini skill bars */}
          <div className="flex flex-col justify-center gap-2.5 flex-1 min-w-0">
            {skills.map((s) => (
              <MiniSkillBar
                key={s.label}
                label={s.label}
                value={s.value}
                color={cefr.color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Result tabs (multi-result) ────────────────────────── */}
      {results.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {results.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all ${
                activeTab === idx
                  ? "bg-primary text-on-primary"
                  : "elevo-card text-on-surface-variant"
              }`}
            >
              Savol {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* ── Transcript — split by [Answer N] ─────────────────── */}
      {current.transcript && (
        <TranscriptSection transcript={current.transcript} />
      )}

      {/* ── Skills ───────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-4 flex flex-col gap-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          Ko'nikmalar
        </p>
        {skills.map((s) => <SkillBar key={s.label} {...s} />)}
      </div>

      {/* ── Metrics grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatChip icon={Hash}       label="So'z soni"      value={String(m.word_count)} />
        <StatChip icon={Zap}        label="Nutq tezligi"   value={speedVal} />
        <StatChip icon={Clock}      label="Davomiyligi"    value={durationVal} />
        <StatChip icon={TrendingUp} label="To'ldirgichlar" value={`${(m.filler_ratio * 100).toFixed(1)}%`} />
      </div>

      {/* ── Feedback ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">
          Baho va tavsiyalar
        </p>
        <FeedbackCard
          title="Yutuqlar"
          uz={r.feedback.strengths.uz}
          en={r.feedback.strengths.en}
          color="#10b981"
          icon={CheckCircle2}
        />
        <FeedbackCard
          title="Kamchiliklar"
          uz={r.feedback.weaknesses.uz}
          en={r.feedback.weaknesses.en}
          color="#f43f5e"
          icon={TrendingUp}
        />
        <FeedbackCard
          title="Maslahatlar"
          uz={r.feedback.improvements.uz}
          en={r.feedback.improvements.en}
          color="#6366f1"
          icon={Zap}
        />
      </div>

      {/* ── AI Improved Versions ─────────────────────────────── */}
      {r.improved_versions && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              AI Yaxshilangan Versiyalar
            </p>
          </div>
          <p className="text-[12px] text-on-surface-variant/60 px-1 -mt-0.5">
            Javobingiz B2 va C1 darajasida qayta yozildi
          </p>

          {r.improved_versions.b2?.text && (
            <ImprovedVersionCard
              level="B2"
              text={r.improved_versions.b2.text}
              rationale={r.improved_versions.b2.level_rationale}
              color="#6366f1"
            />
          )}
          {r.improved_versions.c1?.text && (
            <ImprovedVersionCard
              level="C1"
              text={r.improved_versions.c1.text}
              rationale={r.improved_versions.c1.level_rationale}
              color="#10b981"
            />
          )}
        </div>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <button
        onClick={onFinish}
        className="elevo-btn-primary w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform mt-1"
      >
        Speaking bo'limiga qaytish
        <ChevronRight className="w-5 h-5" />
      </button>

    </div>
  )
}
