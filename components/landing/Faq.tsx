"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "@phosphor-icons/react";
import { Reveal, SectionHeading } from "./Reveal";

/**
 * Las preguntas que alguien se hace de verdad antes de conectar su correo
 * bancario, contestadas de frente — incluidas las incómodas (la advertencia de
 * Google y lo que la app NO puede ver). Esconderlas es lo que hace que una app
 * de plata dé desconfianza; contestarlas es lo que la hace creíble.
 */
const faqs = [
  {
    q: "¿Necesitan la clave de mi banca en línea?",
    a: "No, y nunca te la vamos a pedir. TicoFinanza no entra a tu banco: lee los correos de notificación que tu banco ya te manda a tu Gmail. Es el mismo tipo de acceso que le darías a cualquier app de correo, y es de solo lectura.",
  },
  {
    q: "¿Entonces leen todos mis correos?",
    a: "No. La búsqueda se arma con los remitentes de los bancos que soportamos (bancobcr.com, baccredomatic.com, bncr.fi.cr, y los demás de la lista). Los correos de tu trabajo, tu familia o cualquier otra cosa nunca se tocan.",
  },
  {
    q: "Google me muestra una advertencia de “app no verificada”. ¿Está bien?",
    a: "Sí, y te lo explicamos de frente: leer Gmail es un permiso restringido de Google, y las apps que lo usan tienen que pasar una revisión de seguridad que toma varias semanas. TicoFinanza ya está en ese proceso. Mientras tanto Google muestra esa advertencia a las cuentas nuevas. Podés entrar igual, y revocarle el acceso cuando querás desde tu cuenta de Google.",
  },
  {
    q: "¿Y si mi banco no manda correo de una compra?",
    a: "Ahí no hay nada que hacer del lado nuestro, y preferimos decirlo: si el banco no te manda el correo, esa compra no le llega a TicoFinanza. Por eso podés registrar cualquier movimiento a mano en dos toques, y revisar en los ajustes de tu banco que las notificaciones por correo estén prendidas.",
  },
  {
    q: "Mi banco no está en la lista. ¿Me sirve igual?",
    a: "Sí, aunque a medias: la lectura automática solo funciona con los bancos soportados, pero podés anotar tus movimientos a mano y usar presupuestos, metas y estadísticas igual. Si querés que sumemos el tuyo, escribinos y contanos cuál es.",
  },
  {
    q: "¿Puedo borrar todo si me arrepiento?",
    a: "Sí, desde los ajustes, vos mismo y sin escribirle a nadie. Se borran tus movimientos, tus categorías, tus presupuestos y la conexión con Gmail. También podés exportar todo a CSV antes, para quedarte con tus datos.",
  },
  {
    q: "¿Funciona con SINPE Móvil?",
    a: "Sí. Los SINPE Móvil que te llegan por correo se leen igual que las compras con tarjeta, tanto los que enviás como los que recibís.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <Reveal delay={Math.min(index, 4) * 0.04}>
      <div className="border-b border-line">
        <h3>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-accent cursor-pointer"
          >
            <span className="text-[15px] font-medium text-ink sm:text-base">{q}</span>
            <motion.span
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="shrink-0 text-ink-3"
            >
              <Plus size={18} weight="bold" />
            </motion.span>
          </button>
        </h3>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              key="panel"
              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="max-w-[68ch] pb-5 pr-8 text-sm leading-relaxed text-ink-2">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

export function Faq() {
  return (
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <SectionHeading
        label="Preguntas"
        title="Lo que todos preguntan antes de entrar"
        body="Si algo no queda claro acá, escribinos a info@ticofinanza.com y te contestamos."
      />

      <div className="border-t border-line">
        {faqs.map((faq, i) => (
          <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
        ))}
      </div>
    </div>
  );
}
