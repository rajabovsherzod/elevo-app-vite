import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ReadingPart1Content } from "@/components/elevo/reading/part-1/reading-part1-content"

export default function ReadingPart1Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 1 — Gap Filling" />
      <ReadingPart1Content key={mountKey} />
    </div>
  )
}
