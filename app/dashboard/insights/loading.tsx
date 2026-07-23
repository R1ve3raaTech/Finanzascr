export default function InsightsLoading() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[68px] w-full max-w-3xl items-center gap-3 px-4 sm:px-6">
          <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-900" />
          <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-900" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-zinc-900/60" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-white/10 bg-zinc-900/40"
          />
        ))}
      </div>
    </main>
  );
}
