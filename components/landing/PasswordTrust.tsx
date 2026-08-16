"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, EnvelopeSimpleOpen, X } from "@phosphor-icons/react";

export function PasswordTrust() {
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1fr_1fr] md:items-center md:gap-16">
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <motion.h2
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[22ch] text-2xl font-semibold tracking-tighter text-ink sm:text-3xl"
        >
          Nunca te pedimos la clave de tu banca en línea
        </motion.h2>

        <motion.p
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-2 sm:text-base"
        >
          Solo pedimos permiso de <span className="text-ink">lectura</span> sobre tu Gmail —
          el mismo tipo de acceso que le darías a cualquier casillero de correo. Podés revocarlo
          cuando quieras desde tu cuenta de Google, sin escribirnos.
        </motion.p>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-ink-3"
        >
          <EnvelopeSimpleOpen size={16} weight="bold" className="text-accent" />
          Solo lectura sobre tu correo, nunca escritura
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="divide-y divide-line rounded-xl border border-line"
      >
        <div className="flex items-start gap-3 p-4">
          <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-emerald-400" />
          <p className="text-sm text-ink">
            Leemos las notificaciones que tu banco ya te manda por correo.
          </p>
        </div>
        <div className="flex items-start gap-3 p-4">
          <X size={16} weight="bold" className="mt-0.5 shrink-0 text-ink-3" />
          <p className="text-sm text-ink-3">
            Nunca te pedimos usuario ni clave de tu banca en línea.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
