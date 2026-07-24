import { LoginButton } from "./LoginButton";
import { MockupPreview } from "./MockupPreview";

export function Hero({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 overflow-hidden px-6 pb-20 pt-16 md:min-h-[calc(100dvh-72px)] md:grid-cols-[1.1fr_1fr] md:gap-16 md:pb-24 md:pt-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-sky-400/10 blur-[120px]"
      />

      <div className="relative flex flex-col items-center gap-6 text-center md:items-start md:text-left">
        <span className="animate-fade-up inline-flex -rotate-2 items-center gap-2 rounded-md border border-dashed border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-400">
          100% automático · hecho en Costa Rica
        </span>

        <h1
          className="animate-fade-up text-4xl font-semibold leading-[1.05] tracking-tighter text-zinc-50 md:text-6xl [animation-delay:90ms]"
        >
          Controlá tus finanzas sin mover un solo dedo
        </h1>

        <p className="animate-fade-up max-w-[42ch] text-base leading-relaxed text-zinc-400 md:text-lg [animation-delay:180ms]">
          Todas tus entidades bancarias y tu dinero en un solo lugar.
        </p>

        <div className="animate-fade-up [animation-delay:270ms]">
          <LoginButton large loggedIn={loggedIn} />
        </div>
      </div>

      <div className="animate-fade-up relative flex justify-center [animation-delay:360ms] md:justify-end">
        <MockupPreview />
      </div>
    </section>
  );
}
