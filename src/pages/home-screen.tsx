import { WelcomeCard }   from "@/components/elevo/dashboard/welcome-card";
import { ProgressCard }  from "@/components/elevo/dashboard/progress-card";
import { ExamStats }     from "@/components/elevo/dashboard/exam-stats";
import { QuickPractice } from "@/components/elevo/dashboard/quick-practice";
import { DebugPanel }    from "@/components/elevo/debug-panel";
import { useAuthStore }  from "@/store/auth.store";
import { getDisplayName } from "@/types/auth.types";

export function HomeScreen() {
    const user = useAuthStore((s) => s.user);

    const displayName = getDisplayName(user);
    const level  = "B1";
    const streak = user?.streak  ?? 0;
    const xp     = user?.xp      ?? 0;

    return (
        <div className="flex flex-col gap-5 relative z-10">
            <WelcomeCard
                name={displayName}
                level={level}
                streak={streak}
                xp={xp}
            />

            <ProgressCard
                level={level}
                progress={0}
                questionsAnswered={0}
                accuracy={0}
                studyTime="0 soat"
            />

            <ExamStats
                listening={0}
                reading={0}
                speaking={0}
                writing={0}
            />

            <QuickPractice />

            <DebugPanel />
        </div>
    );
}
