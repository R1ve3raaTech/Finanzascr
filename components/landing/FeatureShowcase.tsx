"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EnvelopeOpen, CheckCircle } from "@phosphor-icons/react";
import { useCycle } from "@/lib/useCycle";

const cardReveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const pop = { type: "spring", stiffness: 260, damping: 24 } as const;

/** "Se lee solo": un correo que se convierte en un movimiento, en loop. */
function AutoReadDemo() {
  const reduce = useReducedMotion();
  const step = useCycle(2, 1900, !!reduce);

  return (
    <div className="relative flex h-24 items-center justify-center">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="email"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={pop}
            className="flex h-14 w-24 items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800 px-3"
          >
            <EnvelopeOpen size={20} weight="bold" className="text-zinc-400" />
            <span className="text-xs text-zinc-500">Correo</span>
          </motion.div>
        ) : (
          <motion.div
            key="transaction"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={pop}
            className="flex h-14 w-28 items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3"
          >
            <CheckCircle size={18} weight="bold" className="text-emerald-400" />
            <span className="font-mono text-xs text-emerald-300">-₡8.450</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const categories = [
  { name: "Comida", color: "#3987e5" },
  { name: "Transporte", color: "#d95926" },
  { name: "Súper", color: "#199e70" },
  { name: "Entretenimiento", color: "#9085e9" },
];

/** "Se categoriza solo": una sola etiqueta a la vez, nunca dos pisadas. */
function CategorizeDemo() {
  const reduce = useReducedMotion();
  const step = useCycle(categories.length, 1600, !!reduce);
  const cat = categories[step];

  return (
    <div className="flex h-24 flex-col items-center justify-center gap-4">
      <div className="h-2 w-32 rounded-full bg-zinc-800" />
      <AnimatePresence mode="wait">
        <motion.span
          key={cat.name}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            borderColor: `${cat.color}55`,
            background: `${cat.color}1a`,
            color: cat.color,
          }}
          className="flex h-7 items-center rounded-full border px-3 text-xs font-medium"
        >
          {cat.name}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** "Presupuestos con aviso": una barra que crece y cruza el límite. */
function BudgetDemo() {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-24 flex-col justify-center gap-2.5">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Comida</span>
        <span className="font-mono">₡65.000 / ₡60.000</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={
            reduce
              ? { scaleX: 1, backgroundColor: "#fb7185" }
              : {
                  scaleX: [0, 0.72, 0.72, 1.1, 1.1],
                  backgroundColor: ["#34d399", "#34d399", "#fbbf24", "#fbbf24", "#fb7185"],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                  times: [0, 0.3, 0.55, 0.8, 1],
                  ease: "easeInOut",
                }
          }
          className="h-full w-full origin-left rounded-full"
        />
      </div>
      <p className="text-[11px] text-zinc-600">Aviso automático si te pasás del límite</p>
    </div>
  );
}

/** "Estadísticas claras": barras de ingreso/gasto creciendo en loop. */
const monthlyBars = [
  { income: 55, expense: 40 },
  { income: 70, expense: 60 },
  { income: 45, expense: 65 },
  { income: 80, expense: 35 },
];

function ChartsDemo() {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-24 items-end justify-center gap-4 pb-1">
      {monthlyBars.map((bar, i) => (
        <div key={i} className="flex h-full items-end gap-1">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: reduce ? bar.income / 100 : [0, bar.income / 100] }}
            transition={{
              duration: 0.8,
              delay: reduce ? 0 : i * 0.12,
              ease: [0.16, 1, 0.3, 1],
              repeat: reduce ? 0 : Infinity,
              repeatType: "reverse",
              repeatDelay: 1.6,
            }}
            className="h-full w-2.5 origin-bottom rounded-t-sm bg-emerald-400"
          />
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: reduce ? bar.expense / 100 : [0, bar.expense / 100] }}
            transition={{
              duration: 0.8,
              delay: reduce ? 0 : i * 0.12 + 0.06,
              ease: [0.16, 1, 0.3, 1],
              repeat: reduce ? 0 : Infinity,
              repeatType: "reverse",
              repeatDelay: 1.6,
            }}
            className="h-full w-2.5 origin-bottom rounded-t-sm bg-rose-400"
          />
        </div>
      ))}
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
            whileHover={reduce ? undefined : { y: -4 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 p-6 transition-colors hover:border-white/20 ${f.span ?? ""}`}
          >
            <div className="rounded-xl bg-zinc-950/40">
              <Demo />
            </div>
            <h3 className="mt-5 text-base font-medium text-zinc-100">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.body}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
