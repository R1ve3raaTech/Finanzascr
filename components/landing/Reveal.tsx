"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Entrada al hacer scroll, compartida por todas las secciones de la landing.
 * Antes cada sección repetía el mismo bloque de `initial/whileInView/viewport`
 * con valores levemente distintos, así que la página entraba con ritmos
 * diferentes según la sección. Acá queda una sola curva para todas.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Encabezado de sección: etiqueta chiquita + título, con el mismo ritmo siempre. */
export function SectionHeading({
  label,
  title,
  body,
  centered = false,
}: {
  label: string;
  title: string;
  body?: string;
  centered?: boolean;
}) {
  return (
    <Reveal className={centered ? "flex flex-col items-center text-center" : undefined}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{label}</p>
      <h2 className="mt-4 max-w-[26ch] text-balance font-montserrat text-3xl font-bold leading-[1.05] tracking-tighter text-ink md:text-4xl">
        {title}
      </h2>
      {body && (
        <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-ink-2 sm:text-base">{body}</p>
      )}
    </Reveal>
  );
}
