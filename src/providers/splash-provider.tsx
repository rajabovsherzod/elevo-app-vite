import { useState, useCallback, useLayoutEffect } from "react";

// TODO: SplashScreen komponenti tayyor bo'lgach import qiling
// import { SplashScreen } from "@/components/elevo/splash/splash-screen";

export function SplashProvider({ children }: { children: React.ReactNode }) {
    const [splashVisible, setSplashVisible] = useState(true);
    const [contentVisible, setContentVisible] = useState(false);

    useLayoutEffect(() => {
        const hasShown = sessionStorage.getItem("elevo-splash-shown");
        const isNotFound = (window as any).__ELEVO_NOT_FOUND__ === true;

        if (isNotFound) {
            sessionStorage.setItem("elevo-splash-shown", "true");
            setSplashVisible(false);
            setContentVisible(true);
        } else if (hasShown) {
            setSplashVisible(false);
            setContentVisible(true);
        }
    }, []);

    const handleExit = useCallback(() => {
        sessionStorage.setItem("elevo-splash-shown", "true");
        setContentVisible(true);
    }, []);

    const handleComplete = useCallback(() => setSplashVisible(false), []);

    return (
        <>
            <div
                style={{
                    opacity: contentVisible ? 1 : 0,
                    transition: contentVisible ? "opacity 350ms ease" : "none",
                    willChange: contentVisible ? "auto" : "opacity",
                }}
            >
                {children}
            </div>

            {splashVisible && (
                // TODO: SplashScreen tayyor bo'lgach almashtiring:
                // <SplashScreen onExit={handleExit} onComplete={handleComplete} />
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "var(--el-background)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onClick={() => { handleExit(); setTimeout(handleComplete, 350); }}
                >
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 28, fontWeight: 800, color: "var(--el-primary)" }}>
                        Elevo
                    </span>
                </div>
            )}
        </>
    );
}
