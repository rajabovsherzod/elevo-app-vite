import { StrictMode, Component, lazy, Suspense, type ReactNode, type ErrorInfo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { TelegramAutoAuth } from "@/providers/telegram-auto-auth";
import { SplashProvider } from "@/providers/splash-provider";
import { AppHeader } from "@/components/elevo/layout/app-header";
import { BottomNav } from "@/components/elevo/layout/bottom-nav";
import { DevConsole } from "@/components/dev/dev-console";
import { QuotaExhaustedModal } from "@/components/elevo/shared/quota-exhausted-modal";
import { WelcomeTrialModal } from "@/components/elevo/shared/welcome-trial-modal";
// Critical path — eagerly loaded (first screen users see)
import { HomeScreen } from "@/pages/home-screen";
import { NotFound } from "@/pages/not-found";
import "@/styles/globals.css";

// Lazy-loaded pages — split into separate chunks, loaded on first navigation
// This keeps the initial bundle small → faster first paint
const ProfilePage    = lazy(() => import("@/pages/profile"));
const SkillsPage     = lazy(() => import("@/pages/skills"));
const UpgradePage    = lazy(() => import("@/pages/upgrade"));
const PaymentPage    = lazy(() => import("@/pages/payment"));
const StatsPage      = lazy(() => import("@/pages/stats"));
const ReadingRoutes  = lazy(() => import("@/pages/reading-routes").then(m => ({ default: m.ReadingRoutes })));
const ListeningRoutes = lazy(() => import("@/pages/listening-routes").then(m => ({ default: m.ListeningRoutes })));
const SpeakingRoutes = lazy(() => import("@/pages/speaking-routes").then(m => ({ default: m.SpeakingRoutes })));
const WritingRoutes  = lazy(() => import("@/pages/writing-routes").then(m => ({ default: m.WritingRoutes })));

// Minimal fallback while lazy chunk loads — keeps layout stable
function PageFallback() {
    return <div style={{ minHeight: "40vh" }} />;
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary]", error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: 32, textAlign: "center" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                        Something went wrong
                    </h2>
                    <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
                        {this.state.error.message}
                    </p>
                    <button
                        onClick={() => { this.setState({ error: null }); window.location.reload(); }}
                        style={{ padding: "8px 20px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", cursor: "pointer" }}
                    >
                        Reload
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell() {
    return (
        <div style={{ minHeight: "100dvh" }}>
            <AppHeader />

            <main
                className="flex flex-col mx-auto w-full px-5"
                style={{
                    maxWidth: 800,
                    paddingTop: "calc(env(safe-area-inset-top, 0px) + 112px)",
                    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)",
                    minHeight: "100dvh",
                }}
            >
                <div className="page-enter flex flex-col flex-1">
                    <ErrorBoundary>
                        <Suspense fallback={<PageFallback />}>
                            <Routes>
                                <Route path="/" element={<HomeScreen />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/skills" element={<SkillsPage />} />
                                <Route path="/upgrade" element={<UpgradePage />} />
                                <Route path="/payment" element={<PaymentPage />} />
                                <Route path="/stats" element={<StatsPage />} />

                                {/* Exam Routes */}
                                <Route path="/reading/*" element={<ReadingRoutes />} />
                                <Route path="/listening/*" element={<ListeningRoutes />} />
                                <Route path="/speaking/*" element={<SpeakingRoutes />} />
                                <Route path="/writing/*" element={<WritingRoutes />} />

                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </main>

            <BottomNav />

            <ErrorBoundary>
                <DevConsole />
                <QuotaExhaustedModal />
                <WelcomeTrialModal />
            </ErrorBoundary>
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

// Global error handler for debugging
window.addEventListener('error', (event) => {
    console.error('[GLOBAL ERROR]', event.error);
    console.error('[GLOBAL ERROR] Message:', event.message);
    console.error('[GLOBAL ERROR] Filename:', event.filename);
    console.error('[GLOBAL ERROR] Line:', event.lineno, 'Column:', event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[UNHANDLED REJECTION]', event.reason);
});

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
