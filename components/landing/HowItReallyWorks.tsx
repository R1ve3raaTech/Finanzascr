"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BellRinging, EnvelopeSimple, PencilSimple, Wallet } from "@phosphor-icons/react";

const notes = [
  {
    icon: Wallet,
    title: "El efectivo siempre se anota a mano",
    body: "No hay forma de leer un correo de algo que pagaste en cash. Pero son dos toques desde el botón +, no una hoja de cálculo.",
  },
  {
    icon: EnvelopeSimple,
    title: "Solo leemos lo que tu banco realmente manda por correo",
    body: "Si la notificación no llega a tu Gmail, no existe para nosotros. En BAC, por ejemplo, a veces hay que activar o reenviar el comprobante por correo desde su app — si no, ese movimiento no se puede detectar.",
  },
  {
    icon: PencilSimple,
    title: "¿Se te escapó un movimiento? Elegís el banco real",
    body: "Al agregarlo a mano podés marcar de qué banco era, en vez de que todo quede mezclado bajo 'Efectivo'.",
  },
  {
    icon: BellRinging,
    title: "Los bancos cambian el formato de sus correos de vez en cuando",
    body: "Cuando eso rompe la lectura automática por varios días, te avisamos por notificación para que sepas que hay que revisar a mano mientras tanto.",
  },
];

export function HowItReallyWorks() {
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
      {notes.map((note, i) => {
        const Icon = note.icon;
        return (
          <motion.div
            key={note.title}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-400">
              <Icon size={16} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-100">{note.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{note.body}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
