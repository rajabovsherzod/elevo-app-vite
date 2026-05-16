
import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ListeningPart5Content } from "@/components/elevo/listening/part-5/listening-part5-content"

const EXAM_ID = 1

export default function ListeningPart5Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 5 — Multiple Choice" />
      <ListeningPart5Content key={mountKey} examId={EXAM_ID} />
    </div>
  )
}
