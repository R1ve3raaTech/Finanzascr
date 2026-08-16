"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "@phosphor-icons/react";

export function PrivacySnippet() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center"
    >
      <ShieldCheck size={22} weight="bold" className="text-accent" />
      <h2 className="max-w-[32ch] text-xl font-semibold tracking-tighter text-ink sm:text-2xl">
        Tus datos, protegidos según la Ley 8968
      </h2>
      <p className="max-w-[54ch] text-sm leading-relaxed text-ink-2">
        Cumplimos la Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales
        de Costa Rica: sabés exactamente qué leemos, podés pedir que borremos todo cuando quieras,
        y nunca vendemos tu información a terceros.
      </p>
      <Link
        href="/privacidad"
        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-soft"
      >
        Leer la política de privacidad completa
        <ArrowRight size={14} weight="bold" />
      </Link>
    </motion.div>
  );
}
