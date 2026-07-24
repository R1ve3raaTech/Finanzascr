"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EnvelopeOpen, CheckCircle } from "@phosphor-icons/react";

const cardReveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function AutoReadDemo() {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex h-28 items-center justify-center">
      <motion.div
        animate={reduce ? { opacity: 1 } : { opacity: [1, 1, 0], scale: [1, 1, 0.85] }}
        transition={
          reduce ? undefined : { duration: 2.4, repeat: Infinity, times: [0, 0.55, 1], ease: "easeInOut" }
        }
        className="absolute flex h-14 w-20 items-center justify-center rounded-xl border border-white/10 bg-zinc-800"
      >
        <EnvelopeOpen size={22} weight="bold" className="text-zinc-400" />
      </motion.div>
      <motion.div
        animate={
          reduce
            ? { opacity: 1 }
            : { opacity: [0, 0, 1, 1], scale: [0.85, 0.85, 1, 1] }
        }
        transition={
          reduce ? undefined : { duration: 2.4, repeat: Infinity, times: [0, 0.5, 0.7, 1], ease: "easeInOut" }
        }
        className="absolute flex h-14 w-24 items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3"
      >
        <CheckCircle size={18} weight="bold" className="text-emerald-400" />
        <span className="font-mono text-xs text-emerald-300">-₡8.450</span>
      </motion.div>
    </div>
  );
}

const categories = ["Comida", "Transporte", "Súper", "Entretenimiento"];
const categoryColors = ["#3987e5", "#d95926", "#199e70", "#9085e9"];

function CategorizeDemo() {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-28 flex-col items-center justify-center gap-3">
      <div className="h-2 w-32 rounded-full bg-zinc-800" />
      <div className="relative h-7 w-28">
        {categories.map((cat, i) => (
          <motion.span
            key={cat}
            animate={
              reduce
                ? { opacity: i === 0 ? 1 : 0 }
                : { opacity: [0, 1, 1, 0] }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: 4,
                    repeat: Infinity,
                    delay: i,
                    times: [0, 0.08, 0.85, 1],
                    ease: "easeInOut",
                  }
            }
            style={{ borderColor: `${categoryColors[i]}55`, background: `${categoryColors[i]}1a`, color: categoryColors[i] }}
            className="absolute inset-0 flex items-center justify-center rounded-full border text-xs font-medium"
          >
            {cat}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function BudgetDemo() {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-28 flex-col justify-center gap-2">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Comida</span>
        <span className="font-mono">₡65.000 / ₡60.000</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          animate={
            reduce
              ? { scaleX: 1, backgroundColor: "#fb7185" }
              : {
                  scaleX: [0, 0.7, 1.08, 1.08],
                  backgroundColor: ["#34d399", "#34d399", "#fbbf24", "#fb7185"],
                }
          }
          transition={
            reduce
              ? undefined
              : { duration: 3.6, repeat: Infinity, times: [0, 0.5, 0.85, 1], ease: "easeInOut" }
          }
          className="h-full w-full origin-left rounded-full"
        />
      </div>
      <p className="text-[11px] text-zinc-600">Aviso automático si te pasás del límite</p>
    </div>
  );
}

const barHeights = [
  [40, 65, 30],
  [70, 45, 60],
  [55, 80, 40],
];

function ChartsDemo() {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-28 items-end justify-center gap-3 pb-2">
      {[0, 1, 2, 3, 4].map((col) => {
        const heights = barHeights[col % barHeights.length];
        return (
          <div key={col} className="flex h-full w-4 items-end gap-0.5">
            <motion.div
              animate={reduce ? { scaleY: heights[0] / 100 } : { scaleY: heights.map((h) => h / 100) }}
              transition={
                reduce
                  ? undefined
                  : { duration: 3, repeat: Infinity, delay: col * 0.15, ease: "easeInOut" }
              }
              className="h-full w-1.5 origin-bottom rounded-t-sm bg-emerald-400"
            />
            <motion.div
              animate={
                reduce
                  ? { scaleY: (100 - heights[0]) / 130 }
                  : { scaleY: heights.map((h) => (100 - h) / 130) }
              }
              transition={
                reduce
                  ? undefined
                  : { duration: 3, repeat: Infinity, delay: col * 0.15, ease: "easeInOut" }
              }
              className="h-full w-1.5 origin-bottom rounded-t-sm bg-rose-400"
            />
          </div>
        );
      })}
    </div>
  );
}

const features = [
  {
    title: "Se lee solo",
    body: "Cada correo de compra o transferencia se convierte en un movimiento, sin que hagas nada.",
    demo: AutoReadDemo,
    span: "sm:col-span-2",
  },
  {
    title: "Se categoriza solo",
    body: "La IA le pone categoría a lo que gastás, para que los gráficos digan algo de verdad.",
    demo: CategorizeDemo,
  },
  {
    title: "Presupuestos con aviso",
    body: "Le ponés un límite mensual a cada categoría y te avisamos cuando te lo pasás.",
    demo: BudgetDemo,
  },
  {
    title: "Estadísticas claras",
    body: "Ingresos y gastos por mes, por banco, por categoría. De un vistazo.",
    demo: ChartsDemo,
  },
];

export function FeatureShowcase() {
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f, i) => {
        const Demo = f.demo;
        return (
          <motion.div
            key={f.title}
            variants={cardReveal}
            initial={reduce ? undefined : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 p-6 ${f.span ?? ""}`}
          >
            <Demo />
            <h3 className="mt-4 text-base font-medium text-zinc-100">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.body}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
