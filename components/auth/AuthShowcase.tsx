"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BankLogo } from "@/components/dashboard/BankLogo";
import type { BankName } from "@/lib/types";

const cards = [
  {
    bank: "BAC" as BankName,
    description: "AutoMercado",
    amount: "-₡8.450",
    income: false,
    rotate: -6,
    x: -18,
    y: 0,
    delay: 0,
  },
  {
    bank: "BP" as BankName,
    description: "María Solano",
    amount: "+₡25.000",
    income: true,
    rotate: 4,
    x: 30,
    y: 64,
    delay: 0.6,
  },
  {
    bank: "PayPal" as BankName,
    description: "Uber Eats",
    amount: "-$12,90",
    income: false,
    rotate: -3,
    x: -10,
    y: 132,
    delay: 1.2,
  },
];

const marqueeBanks: BankName[] = ["BAC", "BCR", "BNCR", "BP", "Davivienda", "MUCAP", "PayPal"];

export function AuthShowcase() {
  const reduce = useReducedMotion();

  return (
    <div className="relative hidden overflow-hidden border-l border-white/10 bg-zinc-950 lg:flex lg:flex-col lg:justify-between">
      {/* Blobs de fondo, a la deriva en loop. Solo transform + opacity. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="auth-blob-a absolute left-[-10%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-[110px]" />
        <div className="auth-blob-b absolute bottom-[-10%] right-[-5%] h-[24rem] w-[24rem] rounded-full bg-emerald-400/[0.06] blur-[110px]" />
      </div>

      <div className="relative flex flex-1 flex-col justify-center px-16">
        <p className="max-w-[26ch] text-2xl font-semibold leading-snug tracking-tight text-zinc-50">
          Tus movimientos aparecen solos, mientras vos hacés otra cosa.
        </p>
        <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-zinc-500">
          Cada notificación de tu banco se convierte en un gasto o ingreso
          categorizado, en tiempo real.
        </p>

        <div className="relative mt-16 h-[230px] w-[300px]">
          {cards.map((card) => (
            <motion.div
              key={card.bank}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={
                reduce
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: 1,
                      y: [card.y, card.y - 10, card.y],
                    }
              }
              transition={
                reduce
                  ? { duration: 0.4 }
                  : {
                      opacity: { duration: 0.6, delay: card.delay },
                      scale: { duration: 0.6, delay: card.delay },
                      y: {
                        repeat: Infinity,
                        duration: 4.5,
                        ease: "easeInOut",
                        delay: card.delay,
                      },
                    }
              }
              style={{
                position: "absolute",
                left: card.x + 40,
                top: 0,
                rotate: card.rotate,
              }}
              className="flex w-64 items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/90 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur"
            >
              <BankLogo bank={card.bank} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-100">{card.description}</p>
                <p className="text-xs text-zinc-500">{card.bank}</p>
              </div>
              <span
                className={`shrink-0 font-mono text-sm ${
                  card.income ? "text-emerald-400" : "text-zinc-300"
                }`}
              >
                {card.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Marquee de bancos, en loop infinito. */}
      <div className="relative border-t border-white/10 py-6">
        <div className={`flex w-max gap-12 ${reduce ? "" : "auth-marquee"}`}>
          {[...marqueeBanks, ...marqueeBanks].map((bank, i) => (
            <div key={`${bank}-${i}`} className="flex shrink-0 items-center gap-2 opacity-60">
              <BankLogo bank={bank} size={24} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
