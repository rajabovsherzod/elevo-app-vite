import { WelcomeCard }   from "@/components/elevo/dashboard/welcome-card";
import { ProgressCard }  from "@/components/elevo/dashboard/progress-card";
import { ExamStats }     from "@/components/elevo/dashboard/exam-stats";
import { QuickPractice } from "@/components/elevo/dashboard/quick-practice";
import { DebugPanel }    from "@/components/elevo/debug-panel";

export function HomeScreen() {
    return (
        <div className="flex flex-col gap-5 relative z-10">
            <WelcomeCard
                name="Foydalanuvchi"
                level="B1"
                streak={0}
                xp={0}
            />

            <ProgressCard
                level="B1"
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
