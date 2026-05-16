import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ReadingPart5Content } from "@/components/elevo/reading/part-5/reading-part5-content"

export default function ReadingPart5Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 5 — Gap Filling + MCQ" />
      <ReadingPart5Content key={mountKey} />
    </div>
  )
}
