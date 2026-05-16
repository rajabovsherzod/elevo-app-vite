import { Route, Routes } from "react-router";
import { BookOpen } from "@/lib/icons";
import { SkillPartGuard } from "@/components/elevo/shared/skill-part-guard";
import ReadingPage from "./reading/index";
import ReadingPart1Page from "./reading/part-1";
import ReadingPart2Page from "./reading/part-2";
import ReadingPart3Page from "./reading/part-3";
import ReadingPart4Page from "./reading/part-4";
import ReadingPart5Page from "./reading/part-5";
import ReadingMockPage from "./reading/mock";

const GUARD = <SkillPartGuard skill="reading" skillTitle="Reading" skillIcon={BookOpen} skillColor="#3b82f6" />;

export function ReadingRoutes() {
  return (
    <Routes>
      <Route index element={<ReadingPage />} />
      <Route element={GUARD}>
        <Route path="part-1" element={<ReadingPart1Page />} />
        <Route path="part-2" element={<ReadingPart2Page />} />
        <Route path="part-3" element={<ReadingPart3Page />} />
        <Route path="part-4" element={<ReadingPart4Page />} />
        <Route path="part-5" element={<ReadingPart5Page />} />
        <Route path="mock" element={<ReadingMockPage />} />
      </Route>
    </Routes>
  );
}
