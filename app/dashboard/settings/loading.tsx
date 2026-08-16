export default function SettingsLoading() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-ground">
      <header className="border-b border-line">
        <div className="mx-auto flex h-[68px] w-full max-w-2xl items-center gap-3 px-4 sm:px-6">
          <div className="h-8 w-8 animate-pulse rounded-full bg-surface" />
          <div className="h-4 w-20 animate-pulse rounded-full bg-surface" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-line bg-surface/40"
          />
        ))}
      </div>
    </main>
  );
}
