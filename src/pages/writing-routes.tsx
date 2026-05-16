import { Route, Routes } from "react-router";
import { PenLine } from "@/lib/icons";
import { SkillPartGuard } from "@/components/elevo/shared/skill-part-guard";
import WritingPage from "./writing/index";
import WritingPart1_1Page from "./writing/part-1-1";

const GUARD = <SkillPartGuard skill="writing" skillTitle="Writing" skillIcon={PenLine} skillColor="#f59e0b" />;

export function WritingRoutes() {
  return (
    <Routes>
      <Route index element={<WritingPage />} />
      <Route element={GUARD}>
        <Route path="part-1-1" element={<WritingPart1_1Page />} />
      </Route>
    </Routes>
  );
}
