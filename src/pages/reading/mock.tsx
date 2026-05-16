import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ReadingMockContent } from "@/components/elevo/reading/mock/reading-mock-content"

export default function ReadingMockPage() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Reading Full Mock" />
      <ReadingMockContent key={mountKey} />
    </div>
  )
}
