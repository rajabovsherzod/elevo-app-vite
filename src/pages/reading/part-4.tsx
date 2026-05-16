import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ReadingPart4Content } from "@/components/elevo/reading/part-4/reading-part4-content"

export default function ReadingPart4Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 4 — MCQ Questions" />
      <ReadingPart4Content key={mountKey} />
    </div>
  )
}
