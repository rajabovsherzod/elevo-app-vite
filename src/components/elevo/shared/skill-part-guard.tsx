import { Outlet } from "react-router"
import { useSkillAccess } from "@/hooks/auth/use-skill-access"
import { NeedPaid } from "./need-paid"
import { PageHeaderWithBack } from "./page-header-with-back"
import { SkillLoading } from "./skill-loading"
import type { SkillName } from "@/types/auth.types"
import type { LucideIcon } from "@/lib/icons"

interface SkillPartGuardProps {
  skill: SkillName
  skillTitle: string
  skillIcon: LucideIcon
  skillColor: string
}

/**
 * React Router layout route — part sahifalarini qo'riqlaydi.
 * Skill index (parts list) ochiq qoladi; faqat alohida partlarga kirganda bloklanadi.
 * Access yo'q bo'lsa: back button header + NeedPaid ko'rsatiladi, exam yuklanmaydi.
 */
export function SkillPartGuard({ skill, skillTitle, skillIcon, skillColor }: SkillPartGuardProps) {
  const { canAccess, reason, upgradeUrl } = useSkillAccess(skill)

  // Auth store hali hydrate bo'lmagan (token bor lekin user yuklanmagan)
  if (reason === "loading") return <SkillLoading />

  if (!canAccess) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <PageHeaderWithBack title={skillTitle} />
        <NeedPaid
          skill={skill}
          skillTitle={skillTitle}
          skillIcon={skillIcon}
          skillColor={skillColor}
          upgradeUrl={upgradeUrl}
          reason={reason}
        />
      </div>
    )
  }

  return <Outlet />
}
