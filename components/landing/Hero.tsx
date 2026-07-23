import { LoginButton } from "./LoginButton";
import { MockupPreview } from "./MockupPreview";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-16 md:min-h-[calc(100dvh-72px)] md:grid-cols-[1.1fr_1fr] md:gap-16 md:pb-24 md:pt-0">
      <div className="flex flex-col items-start gap-6">
        <span className="animate-fade-up rounded-full border border-white/10 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-300">
          100% Automático para Costa Rica 🇨🇷
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
          <LoginButton large />
        </div>
      </div>

      <div className="animate-fade-up flex justify-center [animation-delay:360ms] md:justify-end">
        <MockupPreview />
      </div>
    </section>
  );
}
