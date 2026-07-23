export default function DashboardLoading() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[68px] w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-900" />
          <div className="h-8 w-32 animate-pulse rounded-full bg-zinc-900" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="h-8 w-64 animate-pulse rounded-full bg-zinc-900" />
        <div className="h-32 animate-pulse rounded-2xl border border-white/10 bg-zinc-900/60" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl border border-white/10 bg-zinc-900/60"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
