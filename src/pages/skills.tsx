import { useEffect } from "react"
import { BookOpen, Headphones, Mic, PenLine, type LucideIcon } from "@/lib/icons"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { TrialBanner } from "@/components/elevo/shared/trial-banner"
import { SkillCard } from "@/components/elevo/skills/skill-card"
import { useAuthStore } from "@/store/auth.store"
import type { SkillName } from "@/types/auth.types"

// Per-skill deep prefetch — lazy content chunks inside route bundles
const SKILL_PREFETCH: Record<SkillName, () => void> = {
  listening: () => {
    import("@/pages/listening-routes")
    import("@/components/elevo/listening/part-2/listening-part2-content")
  },
  reading: () => {
    import("@/pages/reading-routes")
  },
  speaking: () => {
    import("@/pages/speaking-routes")
  },
  writing: () => {
    import("@/pages/writing-routes")
  },
}

const SKILL_CARDS: { icon: LucideIcon; title: string; count: number; href: string; skillKey: SkillName }[] = [
  { icon: Headphones, title: "Listening", count: 24, href: "/listening", skillKey: "listening" },
  { icon: BookOpen,   title: "Reading",   count: 32, href: "/reading",   skillKey: "reading"   },
  { icon: Mic,        title: "Speaking",  count: 18, href: "/speaking",  skillKey: "speaking"  },
  { icon: PenLine,    title: "Writing",   count: 15, href: "/writing",   skillKey: "writing"   },
]

export default function SkillsPage() {
  const skills = useAuthStore((s) => s.user?.skills)

  useEffect(() => {
    // Prefetch all skill route chunks while user browses the skills page
    import("@/pages/reading-routes")
    import("@/pages/listening-routes")
    import("@/pages/speaking-routes")
    import("@/pages/writing-routes")
    import("@/assets/exam-loading.json").catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Skills Practice"
        subtitle="Til ko'nikmalarini rivojlantiring"
        icon={BookOpen}
      />

      <div className="grid grid-cols-2 gap-4">
        {SKILL_CARDS.map((card) => (
          <SkillCard
            key={card.skillKey}
            icon={card.icon}
            title={card.title}
            count={card.count}
            href={card.href}
            info={skills?.[card.skillKey]}
            prefetchFn={SKILL_PREFETCH[card.skillKey]}
          />
        ))}
      </div>

      <TrialBanner />
    </div>
  )
}
