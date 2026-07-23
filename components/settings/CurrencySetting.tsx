"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { updateDefaultCurrency } from "@/app/dashboard/settings/actions";
import type { Currency } from "@/lib/types";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function CurrencySetting({ initial }: { initial: Currency }) {
  const reduce = useReducedMotion();
  const [currency, setCurrency] = useState<Currency>(initial);
  const [pending, startTransition] = useTransition();

  function pick(c: Currency) {
    if (c === currency) return;
    setCurrency(c);
    startTransition(async () => {
      await updateDefaultCurrency(c);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">Moneda por defecto</h3>
        <p className="text-xs text-zinc-500">
          La que va a venir preseleccionada al registrar efectivo.
        </p>
      </div>
      <div className="flex rounded-xl border border-white/10 p-1">
        {(["CRC", "USD"] as const).map((c) => (
          <motion.button
            key={c}
            onClick={() => pick(c)}
            disabled={pending}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            transition={tap}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
              currency === c
                ? "bg-zinc-800 text-zinc-50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {c === "CRC" ? "₡ Colones" : "$ Dólares"}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
