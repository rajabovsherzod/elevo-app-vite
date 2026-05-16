import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ReadingPart3Content } from "@/components/elevo/reading/part-3/reading-part3-content"

export default function ReadingPart3Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 3 — Multiple Choice" />
      <ReadingPart3Content key={mountKey} />
    </div>
  )
}
