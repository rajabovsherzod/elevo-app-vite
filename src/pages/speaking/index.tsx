import { Link } from "react-router"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { Mic, Play, Clock, MessageSquare, Users, Lightbulb, ChevronRight, type LucideIcon } from "@/lib/icons"

const PARTS = [
  {
    id: "1.1",
    title: "Introduction",
    description: "Qisqa tanishuv savollari",
    level: "B1",
    levelColor: "#f59e0b",
    icon: MessageSquare,
    href: "/speaking/part-1-1",
    duration: "1.5 min",
  },
  {
    id: "1.2",
    title: "Familiar Topics",
    description: "Rasm tavsifi va follow-up savollar",
    level: "B1–B2",
    levelColor: "#6366f1",
    icon: Users,
    href: "/speaking/part-1-2",
    duration: "1.5 min",
  },
  {
    id: "2",
    title: "Long Turn",
    description: "Uzun monolog — 2 daqiqa",
    level: "B2",
    levelColor: "#6366f1",
    icon: Clock,
    href: "/speaking/part-2",
    duration: "2 min",
  },
  {
    id: "3",
    title: "Discussion",
    description: "Mavzu bo'yicha fikr almashish",
    level: "B2–C1",
    levelColor: "#10b981",
    icon: Lightbulb,
    href: "/speaking/part-3",
    duration: "3 min",
  },
]

export default function SpeakingPage() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeader title="Speaking" icon={Mic} />

      {/* Full Mock */}
      <Link
        to="/speaking/full-mock"
        className="elevo-card elevo-card-border p-5 flex items-center gap-4 active:scale-[0.98] transition-transform"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
          <Play className="w-6 h-6 text-primary fill-primary/30" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
            To'liq test · 11 min
          </p>
          <p className="text-[16px] font-bold text-on-surface">Full Mock Test</p>
        </div>
        <ChevronRight className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
      </Link>

      {/* Parts */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1 mb-3">
          Parts
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PARTS.map((part) => (
            <SpeakingPartCard key={part.id} {...part} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface SpeakingPartCardProps {
  id: string
  title: string
  description: string
  level: string
  levelColor: string
  icon: LucideIcon
  href: string
  duration: string
}

function SpeakingPartCard({ id, title, description, level, levelColor, icon: Icon, href }: SpeakingPartCardProps) {
  return (
    <Link
      to={href}
      className="elevo-card elevo-card-border p-4 flex flex-col gap-3 active:scale-[0.97] transition-transform"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{
            color: levelColor,
            background: `color-mix(in srgb, ${levelColor} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${levelColor} 20%, transparent)`,
          }}
        >
          {level}
        </span>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
          Part {id}
        </p>
        <p className="text-[14px] font-bold text-on-surface leading-snug">{title}</p>
        <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">{description}</p>
      </div>
    </Link>
  )
}
