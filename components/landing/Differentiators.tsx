"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Minus } from "@phosphor-icons/react";

const rows = [
  {
    before: "Anotar cada gasto a mano, todos los días",
    after: "Se registra solo, leyendo lo que tu banco ya te manda",
  },
  {
    before: "Reenviar cada correo bancario a un buzón externo",
    after: "Conectás tu Gmail una sola vez y listo",
  },
  {
    before: "Darle tu contraseña de banca en línea a un tercero",
    after: "Nunca pedimos esa clave: solo un login de Google",
  },
  {
    before: "No saber qué hace la app con tus correos",
    after: "Te decimos exacto qué leemos y qué guardamos, en la política",
  },
];

const row = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

export function Differentiators() {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col divide-y divide-white/5">
      {rows.map((r, i) => (
        <motion.div
          key={r.before}
          variants={row}
          initial={reduce ? undefined : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 items-center gap-3 py-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-6"
        >
          <div className="flex items-start gap-3 sm:justify-end sm:text-right">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-600 sm:order-2">
              <Minus size={12} weight="bold" />
            </span>
            <p className="text-sm text-zinc-500 line-through decoration-zinc-700 sm:order-1">
              {r.before}
            </p>
          </div>

          <ArrowRight
            size={16}
            weight="bold"
            className="hidden shrink-0 text-sky-400/70 sm:block"
          />

          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
              <Check size={12} weight="bold" />
            </span>
            <p className="text-sm font-medium text-zinc-100">{r.after}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
