import { GraduationCap } from "@/lib/icons"

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
        <GraduationCap className="w-[18px] h-[18px] text-white" aria-hidden />
      </div>
      <span className="text-xl font-extrabold tracking-tight text-white">Elevo</span>
    </div>
  )
}

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary dark:bg-surface rounded-b-2xl">
      <div className="mx-auto max-w-[800px]">
        <div className="flex items-center justify-center px-6 pt-[calc(env(safe-area-inset-top,0px)+44px)] pb-3">
          <Logo />
        </div>
      </div>
    </header>
  )
}
