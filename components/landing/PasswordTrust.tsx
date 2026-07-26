"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EnvelopeSimpleOpen, LockKey, Prohibit } from "@phosphor-icons/react";

export function PasswordTrust() {
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-16 w-16 items-center justify-center rounded-full border border-sky-400/25 bg-sky-400/10"
      >
        <LockKey size={26} weight="bold" className="text-sky-400" />
        <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-950 bg-rose-400 text-zinc-950">
          <Prohibit size={14} weight="bold" />
        </span>
      </motion.div>

      <motion.h2
        initial={reduce ? undefined : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 max-w-[26ch] text-2xl font-semibold tracking-tighter text-zinc-50 sm:text-3xl"
      >
        Nunca te pedimos la clave de tu banca en línea
      </motion.h2>

      <motion.p
        initial={reduce ? undefined : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-3 max-w-[54ch] text-sm leading-relaxed text-zinc-400 sm:text-base"
      >
        Solo pedimos permiso de <span className="text-zinc-200">lectura</span> sobre tu Gmail — el
        mismo tipo de acceso que le darías a cualquier casillero de correo. Nunca vemos, pedimos ni
        guardamos contraseñas de banco. Podés revocar el acceso cuando quieras desde tu cuenta de
        Google, sin escribirnos.
      </motion.p>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 grid w-full gap-3 sm:grid-cols-2"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
            <EnvelopeSimpleOpen size={16} weight="bold" />
          </div>
          <p className="text-sm text-zinc-200">
            Leemos las notificaciones que tu banco ya te manda por correo.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/40 p-4 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-500">
            <LockKey size={16} weight="bold" />
          </div>
          <p className="text-sm text-zinc-500">
            Nunca te pedimos usuario ni clave de tu banca en línea.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
