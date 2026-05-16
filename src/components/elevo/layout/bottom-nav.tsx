import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router"
import { Home, BookOpen, Sparkles, TrendingUp, User, type LucideIcon } from "@/lib/icons"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  isUpgrade?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",        label: "Home",   icon: Home },
  { href: "/skills",  label: "Skills", icon: BookOpen },
  { href: "/upgrade", label: "Pro",    icon: Sparkles, isUpgrade: true },
  { href: "/stats",   label: "Stats",  icon: TrendingUp },
  { href: "/profile", label: "Me",     icon: User },
]

const EXAM_ROUTES = [
  "/reading/part-",
  "/speaking/part-",
  "/listening/part-",
  "/reading/mock",
  "/listening/mock",
]

/* ── Upgrade FAB ──────────────────────────────────────────── */

function UpgradeTab({ isActive }: { isActive: boolean }) {
  return (
    <Link
      to="/upgrade"
      className="flex-1 flex flex-col items-center justify-end pb-1 relative"
      aria-label="Upgrade to Pro"
      aria-current={isActive ? "page" : undefined}
    >
      <div className="flex flex-col items-center -translate-y-4">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 72, height: 72,
            top: "50%", left: "50%",
            transform: "translate(-50%, -60%)",
            background: "radial-gradient(circle, rgba(124,58,237,0.55) 0%, rgba(79,70,229,0.25) 55%, transparent 80%)",
            filter: "blur(12px)",
          }}
        />

        {/* FAB — CSS spring via cubic-bezier, no framer-motion */}
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, #4f46e5 0%, #7c3aed 45%, #9333ea 100%)",
            boxShadow: [
              "0 0 0 1.5px rgba(255,255,255,0.18) inset",
              "0 6px 24px rgba(109,40,217,0.55)",
              "0 2px 8px rgba(79,70,229,0.45)",
              "0 1px 0 rgba(255,255,255,0.12) inset",
            ].join(", "),
            transform: isActive ? "scale(1.08)" : "scale(1)",
            transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Shimmer */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-full opacity-25 pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, transparent 50%)" }}
          />
          <Sparkles
            className="relative w-[22px] h-[22px] text-white"
            strokeWidth={isActive ? 2.5 : 2}
            aria-hidden
          />
        </div>

        {/* Gradient label */}
        <span
          className="mt-1.5 text-[9px] font-extrabold tracking-[0.15em] uppercase select-none"
          style={{
            background: "linear-gradient(90deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          PRO
        </span>
      </div>
    </Link>
  )
}

/* ── Regular nav item ─────────────────────────────────────── */

function NavTab({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon

  if (item.isUpgrade) return <UpgradeTab isActive={isActive} />

  return (
    <Link
      to={item.href}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative select-none"
      aria-current={isActive ? "page" : undefined}
    >
      {/* Top-bar indicator — CSS scale+fade instead of layoutId spring */}
      <span
        className="absolute top-0 w-7 h-[3px] rounded-full"
        style={{
          background: "var(--el-primary)",
          opacity: isActive ? 1 : 0,
          transform: isActive ? "scaleX(1)" : "scaleX(0.3)",
          transition: "opacity 180ms ease, transform 280ms cubic-bezier(0.34,1.56,0.64,1)",
          transformOrigin: "center",
        }}
      />

      {/* Icon — scale + lift on active */}
      <div
        className="w-10 h-8 flex items-center justify-center relative"
        style={{
          transform: isActive ? "scale(1.18) translateY(-1px)" : "scale(1) translateY(0)",
          transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Glow layer */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "var(--el-primary)",
            filter: "blur(8px)",
            opacity: isActive ? 0.45 : 0,
            transition: "opacity 120ms ease",
            transform: "scale(0.8)",
          }}
        />
        <Icon
          className="relative w-5 h-5"
          style={{
            color: isActive ? "var(--el-primary)" : "var(--el-on-surface-variant)",
            strokeWidth: isActive ? 2.5 : 2,
            transition: "color 150ms ease",
          }}
          aria-hidden
        />
      </div>

      {/* Label */}
      <span
        className="text-[9px] font-bold tracking-[0.10em] uppercase"
        style={{
          color: isActive ? "var(--el-primary)" : "var(--el-on-surface-variant)",
          opacity: isActive ? 1 : 0.6,
          transition: "color 150ms ease, opacity 150ms ease",
        }}
      >
        {item.label}
      </span>
    </Link>
  )
}

/* ── Shell ────────────────────────────────────────────────── */

export function BottomNav() {
  const { pathname } = useLocation()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  const isExamPage = EXAM_ROUTES.some((r) => pathname.startsWith(r))

  useEffect(() => {
    const check = () => {
      if (window.visualViewport)
        setIsKeyboardOpen(window.visualViewport.height < window.innerHeight - 100)
    }
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") setIsKeyboardOpen(true)
    }
    const onFocusOut = () => {
      if (!window.visualViewport || window.visualViewport.height >= window.innerHeight - 100)
        setIsKeyboardOpen(false)
    }

    window.visualViewport?.addEventListener("resize", check)
    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)
    return () => {
      window.visualViewport?.removeEventListener("resize", check)
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
    }
  }, [])

  if (isExamPage || isKeyboardOpen) return null

  return (
    <nav
      data-bottom-nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "var(--el-glass-bg)",
        backdropFilter: "blur(var(--el-glass-blur))",
        WebkitBackdropFilter: "blur(var(--el-glass-blur))",
        borderTop: "1px solid var(--el-glass-border)",
        boxShadow: "0 -1px 0 0 var(--el-nav-sep), 0 -8px 32px rgba(0,0,0,0.06)",
      }}
      aria-label="Asosiy navigatsiya"
    >
      <div className="mx-auto max-w-[800px] flex items-center px-2 h-16 overflow-visible">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return <NavTab key={item.href} item={item} isActive={isActive} />
        })}
      </div>
    </nav>
  )
}
