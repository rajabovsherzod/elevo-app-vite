import { Route, Routes } from "react-router";
import { Mic } from "@/lib/icons";
import { SkillPartGuard } from "@/components/elevo/shared/skill-part-guard";
import SpeakingPage from "./speaking/index";
import SpeakingPart1_1Page from "./speaking/part-1-1";
import SpeakingPart1_2Page from "./speaking/part-1-2";
import SpeakingPart2Page from "./speaking/part-2";
import SpeakingPart3Page from "./speaking/part-3";

const GUARD = <SkillPartGuard skill="speaking" skillTitle="Speaking" skillIcon={Mic} skillColor="#10b981" />;

export function SpeakingRoutes() {
  return (
    <Routes>
      <Route index element={<SpeakingPage />} />
      <Route element={GUARD}>
        <Route path="part-1-1" element={<SpeakingPart1_1Page />} />
        <Route path="part-1-2" element={<SpeakingPart1_2Page />} />
        <Route path="part-2"   element={<SpeakingPart2Page />} />
        <Route path="part-3"   element={<SpeakingPart3Page />} />
      </Route>
    </Routes>
  );
}
