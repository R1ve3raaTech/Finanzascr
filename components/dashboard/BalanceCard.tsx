"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatMoney } from "@/lib/format";

export function BalanceCard({
  crc,
  usd,
}: {
  crc: number;
  usd: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      whileHover={reduce ? undefined : { y: -2 }}
      className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 transition-colors hover:border-white/20"
    >
      <h2 className="text-sm font-medium text-zinc-400">Saldo consolidado</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs text-zinc-500">Colones</p>
          <p
            className={`mt-1 font-mono text-3xl tracking-tight ${
              crc < 0 ? "text-rose-400" : "text-zinc-50"
            }`}
          >
            {formatMoney(crc, "CRC")}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Dólares</p>
          <p
            className={`mt-1 font-mono text-3xl tracking-tight ${
              usd < 0 ? "text-rose-400" : "text-zinc-50"
            }`}
          >
            {formatMoney(usd, "USD")}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
