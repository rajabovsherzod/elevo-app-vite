import { Route, Routes } from "react-router";
import { Mic } from "@/lib/icons";
import { SkillPartGuard } from "@/components/elevo/shared/skill-part-guard";
import SpeakingPage from "./speaking/index";

const GUARD = <SkillPartGuard skill="speaking" skillTitle="Speaking" skillIcon={Mic} skillColor="#10b981" />;

export function SpeakingRoutes() {
  return (
    <Routes>
      <Route index element={<SpeakingPage />} />
      <Route element={GUARD}>
        {/* speaking part routes shu yerga qo'shiladi */}
      </Route>
    </Routes>
  );
}
