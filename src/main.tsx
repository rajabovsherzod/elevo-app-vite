import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { TelegramAutoAuth } from "@/providers/telegram-auto-auth";
import { SplashProvider } from "@/providers/splash-provider";
import { AppHeader } from "@/components/elevo/layout/app-header";
import { BottomNav } from "@/components/elevo/layout/bottom-nav";
import { HomeScreen } from "@/pages/home-screen";
import { NotFound } from "@/pages/not-found";
import "@/styles/globals.css";

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell() {
    const { pathname } = useLocation();

    // Exam page'larida header ko'rinmaydi
    const EXAM_ROUTES = ["/reading/part-", "/speaking/part-", "/listening/part-", "/reading/mock", "/listening/mock"];
    const isExamPage = EXAM_ROUTES.some((r) => pathname.startsWith(r));

    return (
        <div style={{ minHeight: "100dvh" }}>
            {!isExamPage && <AppHeader />}

            <main
                className="flex flex-col mx-auto w-full px-5"
                style={{
                    maxWidth: 800,
                    paddingTop: isExamPage ? 0 : "calc(env(safe-area-inset-top, 0px) + 112px)",
                    paddingBottom: isExamPage ? 0 : 100,
                    minHeight: "100dvh",
                }}
            >
                {/* Page enters with animation */}
                <div className="page-enter flex flex-col flex-1">
                    <Routes>
                        <Route path="/" element={<HomeScreen />} />

                        {/* TODO: Pages ko'chirilgach quyida qo'shing: */}
                        {/* <Route path="/skills"   element={<SkillsPage />} /> */}
                        {/* <Route path="/upgrade"  element={<UpgradePage />} /> */}
                        {/* <Route path="/stats"    element={<StatsPage />} /> */}
                        {/* <Route path="/profile"  element={<ProfilePage />} /> */}
                        {/* <Route path="/reading/*"   element={<ReadingRoutes />} /> */}
                        {/* <Route path="/speaking/*"  element={<SpeakingRoutes />} /> */}
                        {/* <Route path="/listening/*" element={<ListeningRoutes />} /> */}
                        {/* <Route path="/writing/*"   element={<WritingRoutes />} /> */}

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </main>

            {!isExamPage && <BottomNav />}
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider storageKey="elevo-theme" darkModeClass="dark-mode" defaultTheme="light">
            <QueryProvider>
                <BrowserRouter>
                    <RouteProvider>
                        <TelegramAutoAuth>
                            <SplashProvider>
                                <AppShell />
                            </SplashProvider>
                        </TelegramAutoAuth>
                    </RouteProvider>
                </BrowserRouter>
            </QueryProvider>
        </ThemeProvider>
    </StrictMode>,
);
