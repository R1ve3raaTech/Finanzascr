"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowsClockwise, Sparkle } from "@phosphor-icons/react";
import { generateInsightsSummary } from "@/app/dashboard/actions";
import type { FinanceSnapshot } from "@/lib/ai/insightsSummary";

export function AiSummary({ snapshot }: { snapshot: FinanceSnapshot }) {
  const reduce = useReducedMotion();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      const result = await generateInsightsSummary(snapshot);
      if (result.error) setError(result.error);
      setSummary(result.summary);
    });
  }

  return (
    <section className="animate-fade-up rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-400/[0.06] to-transparent p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-sky-400">
          <Sparkle size={14} weight="fill" />
        </div>
        <h2 className="text-sm font-medium text-zinc-300">Resumen con IA</h2>
      </div>

      <AnimatePresence mode="wait">
        {!summary && !pending && (
          <motion.div
            key="cta"
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex flex-wrap items-center justify-between gap-3"
          >
            <p className="text-xs text-zinc-500">
              Un resumen corto de cómo viene tu mes, generado por Claude.
            </p>
            <button
              onClick={generate}
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-sky-400/10 px-3 text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-400/15 cursor-pointer"
            >
              <Sparkle size={13} weight="fill" />
              Generar resumen
            </button>
          </motion.div>
        )}

        {pending && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 text-xs text-sky-400"
          >
            <motion.span
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              className="flex"
            >
              <Sparkle size={13} weight="fill" />
            </motion.span>
            Pensando...
          </motion.div>
        )}

        {summary && !pending && (
          <motion.div
            key="summary"
            initial={reduce ? undefined : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex flex-col gap-3"
          >
            <p className="text-sm leading-relaxed text-zinc-200">{summary}</p>
            <button
              onClick={generate}
              className="flex w-fit items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
            >
              <ArrowsClockwise size={12} weight="bold" />
              Regenerar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </section>
  );
}
