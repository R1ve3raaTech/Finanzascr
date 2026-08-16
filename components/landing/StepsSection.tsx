"use client";

import { Reveal, SectionHeading } from "./Reveal";

export function StepsSection({
  heading,
  steps,
}: {
  heading: string;
  steps: { title: string; body: string }[];
}) {
  return (
    <>
      <SectionHeading
        label="Cómo funciona"
        title={heading}
        body="Tres pasos, y el único que hacés vos es el primero."
      />

      <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {/* Hilo que conecta los tres pasos: hace leer la sección como un flujo
            y no como tres tarjetas sueltas. Solo en desktop, que es donde los
            pasos quedan en fila. */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[13px] hidden h-px bg-line md:block"
        />

        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.1} className="relative">
            <div className="flex flex-col gap-3">
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 bg-ground font-mono text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <h3 className="mt-2 text-lg font-medium text-ink">{step.title}</h3>
              <p className="max-w-[38ch] text-sm leading-relaxed text-ink-2">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}
