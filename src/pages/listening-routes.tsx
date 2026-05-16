import { Route, Routes } from "react-router";
import { Headphones } from "@/lib/icons";
import { SkillPartGuard } from "@/components/elevo/shared/skill-part-guard";
import ListeningPage from "./listening/index";
import ListeningPart1Page from "./listening/part-1";
import ListeningPart2Page from "./listening/part-2";
import ListeningPart3Page from "./listening/part-3";
import ListeningPart4Page from "./listening/part-4";
import ListeningPart5Page from "./listening/part-5";
import ListeningPart6Page from "./listening/part-6";
import ListeningMockPage from "./listening/mock";

const GUARD = <SkillPartGuard skill="listening" skillTitle="Listening" skillIcon={Headphones} skillColor="#7c3aed" />;

export function ListeningRoutes() {
  return (
    <Routes>
      <Route index element={<ListeningPage />} />
      <Route element={GUARD}>
        <Route path="part-1" element={<ListeningPart1Page />} />
        <Route path="part-2" element={<ListeningPart2Page />} />
        <Route path="part-3" element={<ListeningPart3Page />} />
        <Route path="part-4" element={<ListeningPart4Page />} />
        <Route path="part-5" element={<ListeningPart5Page />} />
        <Route path="part-6" element={<ListeningPart6Page />} />
        <Route path="mock" element={<ListeningMockPage />} />
      </Route>
    </Routes>
  );
}
