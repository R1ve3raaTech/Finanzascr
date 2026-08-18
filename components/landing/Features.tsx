"use client";

import {
  ArrowsClockwise,
  BellRinging,
  ChartPieSlice,
  Coins,
  DeviceMobile,
  DownloadSimple,
  EnvelopeSimple,
  Sparkle,
  Target,
} from "@phosphor-icons/react";
import { Reveal, SectionHeading } from "./Reveal";

/**
 * Solo funciones que ya existen y andan en producción — nada de "próximamente".
 * Si se agrega una acá, tiene que estar realmente implementada.
 */
const features = [
  {
    icon: Sparkle,
    title: "Categorización con IA",
    body: "Cada movimiento llega con su categoría puesta. Si no le achuntó, la cambiás de un toque.",
  },
  {
    icon: ChartPieSlice,
    title: "Estadísticas del mes",
    body: "En qué se te va la plata, por categoría y por comercio, mes contra mes.",
  },
  {
    icon: Target,
    title: "Presupuestos y metas",
    body: "Poné un tope por categoría y una meta de ahorro. El avance se calcula solo.",
  },
  {
    icon: BellRinging,
    title: "Avisos al pasarte",
    body: "Notificación en el teléfono cuando un gasto te saca del presupuesto del mes.",
  },
  {
    icon: ArrowsClockwise,
    title: "Suscripciones detectadas",
    body: "Encuentra los cobros que se repiten todos los meses, aunque nunca los anotaras.",
  },
  {
    icon: EnvelopeSimple,
    title: "Varios correos a la vez",
    body: "¿Tenés el banco en un Gmail y las compras en otro? Conectá los que necesités.",
  },
  {
    icon: Coins,
    title: "Todo en colones",
    body: "Un gasto en dólares, euros o córdobas se convierte solo, con el tipo de cambio del día.",
  },
  {
    icon: DownloadSimple,
    title: "Tus datos son tuyos",
    body: "Exportá todo a CSV cuando querás, o borrá la cuenta entera sin escribirle a nadie.",
  },
];

export function Features() {
  return (
    <>
      <SectionHeading
        label="Qué obtenés"
        title="Todo lo que hace TicoFinanza por vos"
        body="No es solo una lista de gastos: es lo que harías vos en una hoja de cálculo, pero hecho solo y todos los días."
      />

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => (
          <Reveal
            key={feature.title}
            delay={Math.min(i, 4) * 0.05}
            className="group bg-ground transition-colors hover:bg-surface"
          >
            <div className="flex h-full flex-col gap-3 p-6">
              <feature.icon
                size={20}
                weight="bold"
                className="text-accent transition-transform duration-300 group-hover:-translate-y-0.5"
              />
              <h3 className="text-[15px] font-medium text-ink">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{feature.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-ink-3">
          <DeviceMobile size={14} weight="bold" className="text-ink-3" />
          Se instala en el teléfono como una app, desde el mismo navegador.
        </p>
      </Reveal>
    </>
  );
}
