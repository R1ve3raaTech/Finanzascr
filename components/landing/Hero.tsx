import { LoginButton } from "./LoginButton";
import { MockupPreview } from "./MockupPreview";

export function Hero({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 overflow-hidden px-6 pb-20 pt-16 md:min-h-[calc(100dvh-72px)] md:grid-cols-[1.1fr_1fr] md:gap-16 md:pb-24 md:pt-0">
      <div className="relative flex flex-col items-center gap-7 text-center md:items-start md:text-left">
        <p className="animate-fade-up font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          Costa Rica · lectura automática de correos bancarios
        </p>

        <h1 className="animate-fade-up font-montserrat text-[2.75rem] font-bold leading-[0.98] tracking-tighter text-zinc-50 md:text-7xl [animation-delay:90ms]">
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
