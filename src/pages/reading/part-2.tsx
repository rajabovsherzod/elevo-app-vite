import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ReadingPart2Content } from "@/components/elevo/reading/part-2/reading-part2-content"

export default function ReadingPart2Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 2 — Match Passages" />
      <ReadingPart2Content key={mountKey} />
    </div>
  )
}
