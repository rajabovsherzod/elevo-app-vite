import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { WritingPart1_1Content } from "@/components/elevo/writing/part-1-1/writing-part1-1-content"

export default function WritingPart1_1Page() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 1.1 — Informal Letter" />
      <WritingPart1_1Content />
    </div>
  )
}
