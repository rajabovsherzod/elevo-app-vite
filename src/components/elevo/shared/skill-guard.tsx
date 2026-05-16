import type { ReactNode } from "react"
import { useSkillAccess } from "@/hooks/auth/use-skill-access"
import { NeedPaid } from "./need-paid"
import type { SkillName } from "@/types/auth.types"
import type { LucideIcon } from "@/lib/icons"

interface SkillGuardProps {
  skill: SkillName
  skillTitle: string
  skillIcon: LucideIcon
  skillColor: string
  children: ReactNode
}

export function SkillGuard({ skill, skillTitle, skillIcon, skillColor, children }: SkillGuardProps) {
  const { canAccess, reason, upgradeUrl } = useSkillAccess(skill)

  if (reason === "loading") return null

  if (!canAccess) {
    return (
      <NeedPaid
        skill={skill}
        skillTitle={skillTitle}
        skillIcon={skillIcon}
        skillColor={skillColor}
        upgradeUrl={upgradeUrl}
        reason={reason}
      />
    )
  }

  return <>{children}</>
}
