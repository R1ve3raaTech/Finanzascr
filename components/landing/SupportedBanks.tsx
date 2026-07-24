"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BankLogo } from "@/components/dashboard/BankLogo";
import type { BankName } from "@/lib/types";

export function SupportedBanks({ banks }: { banks: { bank: BankName; label: string }[] }) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-6">
      {banks.map(({ bank, label }, i) => (
        <motion.div
          key={bank}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-2"
        >
          <BankLogo bank={bank} size={52} />
          <span className="text-xs font-medium text-zinc-400">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}
