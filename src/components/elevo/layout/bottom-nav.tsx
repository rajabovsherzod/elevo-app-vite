import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Home, BookOpen, Sparkles, TrendingUp, User, type LucideIcon } from "@/lib/icons";

interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    isUpgrade?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { href: "/",        label: "Home",    icon: Home },
    { href: "/skills",  label: "Skills",  icon: BookOpen },
    { href: "/upgrade", label: "Upgrade", icon: Sparkles, isUpgrade: true },
    { href: "/stats",   label: "Stats",   icon: TrendingUp },
    { href: "/profile", label: "Profile", icon: User },
];

const EXAM_ROUTES = [
    "/reading/part-",
    "/speaking/part-",
    "/listening/part-",
    "/reading/mock",
    "/listening/mock",
];

function NavTab({ item, isActive }: { item: NavItem; isActive: boolean }) {
    const Icon = item.icon;

    if (item.isUpgrade) {
        return (
            <Link
                to={item.href}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
                aria-current={isActive ? "page" : undefined}
            >
                <div className={[
                    "w-11 h-11 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-primary to-indigo-600",
                    "shadow-md transition-all duration-200",
                    isActive ? "scale-110" : "hover:scale-105 active:scale-95",
                ].join(" ")}
                    style={{ boxShadow: "0 4px 12px var(--el-glow-primary)" }}
                >
                    <Icon className="w-5 h-5 text-white" strokeWidth={2.5} fill="white" aria-hidden />
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "var(--el-primary)" }}>
                    {item.label}
                </span>
            </Link>
        );
    }

    return (
        <Link
            to={item.href}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
            aria-current={isActive ? "page" : undefined}
        >
            <div className={[
                "w-11 h-9 flex items-center justify-center rounded-2xl transition-all duration-200",
                isActive ? "border" : "bg-transparent",
            ].join(" ")}
                style={isActive ? {
                    background: "color-mix(in srgb, var(--el-primary) 15%, transparent)",
                    borderColor: "color-mix(in srgb, var(--el-primary) 25%, transparent)",
                } : {}}
            >
                <Icon
                    className="w-5 h-5 transition-colors"
                    style={{ color: isActive ? "var(--el-primary)" : "var(--el-on-surface-variant)" }}
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden
                />
            </div>
            <span
                className="text-[9px] uppercase tracking-widest font-bold transition-colors"
                style={{ color: isActive ? "var(--el-primary)" : "var(--el-on-surface-variant)" }}
            >
                {item.label}
            </span>
        </Link>
    );
}

export function BottomNav() {
    const { pathname } = useLocation();
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    const isExamPage = EXAM_ROUTES.some((r) => pathname.startsWith(r));

    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                setIsKeyboardOpen(window.visualViewport.height < window.innerHeight - 100);
            }
        };
        const handleFocusIn = (e: FocusEvent) => {
            const t = e.target as HTMLElement;
            if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") setIsKeyboardOpen(true);
        };
        const handleFocusOut = () => {
            if (!window.visualViewport || window.visualViewport.height >= window.innerHeight - 100)
                setIsKeyboardOpen(false);
        };

        window.visualViewport?.addEventListener("resize", handleResize);
        document.addEventListener("focusin", handleFocusIn);
        document.addEventListener("focusout", handleFocusOut);
        return () => {
            window.visualViewport?.removeEventListener("resize", handleResize);
            document.removeEventListener("focusin", handleFocusIn);
            document.removeEventListener("focusout", handleFocusOut);
        };
    }, []);

    if (isExamPage || isKeyboardOpen) return null;

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
            style={{
                background: "var(--el-glass-bg)",
                backdropFilter: `blur(var(--el-glass-blur))`,
                WebkitBackdropFilter: `blur(var(--el-glass-blur))`,
                borderTop: "1px solid var(--el-nav-sep)",
            }}
            aria-label="Asosiy navigatsiya"
        >
            <div className="mx-auto max-w-[800px] flex items-center px-3 h-16">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    return <NavTab key={item.href} item={item} isActive={isActive} />;
                })}
            </div>
        </nav>
    );
}
