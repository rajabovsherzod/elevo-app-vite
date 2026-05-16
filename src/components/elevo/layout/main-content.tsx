export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="flex-1 flex flex-col mx-auto max-w-[800px] w-full px-5 pb-[100px]"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 100px)",
      }}
    >
      {children}
    </main>
  )
}
