import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/Logo";

/**
 * Layout compartido para /privacidad y /terminos: full blanco y negro,
 * sin ningún acento de color — un documento legal se lee serio, no como
 * otra pantalla de producto. Secciones numeradas en vez de tarjetas con
 * íconos de colores.
 */
export function LegalDocument({
  title,
  updatedAt,
  intro,
  summary,
  children,
}: {
  title: string;
  updatedAt: string;
  intro: ReactNode;
  summary?: { label: string; items: string[] };
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-ground text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-[68px] w-full max-w-2xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface hover:text-ink"
          >
            <ArrowLeft size={18} weight="bold" />
          </Link>
          <Logo />
        </div>
      </header>

      <article className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-ink-3">Última actualización: {updatedAt}.</p>
        <div className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-2">{intro}</div>

        {summary && (
          <div className="mt-10 border-y border-line-strong py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-3">
              {summary.label}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {summary.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-2">
                  <span className="text-ink-3">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-col">{children}</div>
      </article>
    </main>
  );
}

export function LegalSection({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-line py-8 first:border-t-0">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-ink-3">{String(number).padStart(2, "0")}</span>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 pl-[calc(1.75rem)] text-[15px] leading-relaxed text-ink-2 [&_a]:text-white [&_a]:underline [&_a]:decoration-ink-3 [&_a]:underline-offset-2 [&_a]:transition-colors [&_a:hover]:decoration-white [&_li]:pl-1 [&_span]:text-ink">
        {children}
      </div>
    </section>
  );
}
