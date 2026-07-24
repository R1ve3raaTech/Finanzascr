"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ShieldCheck } from "@phosphor-icons/react";
import { BankLogo } from "@/components/dashboard/BankLogo";
import { GoogleMark } from "@/components/GoogleMark";
import type { BankName } from "@/lib/types";

const links = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Términos de servicio", href: "/terminos" },
  { label: "Escribinos", href: "mailto:thecamil999@gmail.com" },
];

const marqueeBanks: BankName[] = ["BAC", "BCR", "BNCR", "BP", "Davivienda", "MUCAP", "PayPal"];

export function Footer() {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();
  const MotionLink = motion.create(Link);

  return (
    <motion.footer
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-auto overflow-hidden border-t border-white/10 bg-zinc-950"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-sky-400/[0.05] blur-[120px]"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <p className="select-none font-montserrat text-4xl font-bold leading-none tracking-tighter text-zinc-50 sm:text-5xl">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #4a6fa5 0 16.6%, #e9e7e0 16.6% 33.3%, #b6495a 33.3% 66.6%, #e9e7e0 66.6% 83.3%, #4a6fa5 83.3% 100%)",
              }}
            >
              Tico
            </span>
            Finanza
          </p>
          <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-zinc-500">
            Tus movimientos bancarios, categorizados solos. Sin hojas de cálculo, sin
            anotar nada a mano.
          </p>
          <MotionLink
            href="/entrar"
            whileHover={reduce ? undefined : { x: 2 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 py-2 pl-2 pr-4 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-zinc-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-50">
              <GoogleMark size={13} />
            </span>
            Iniciar sesión
            <ArrowUpRight size={14} weight="bold" className="text-sky-400" />
          </MotionLink>
        </div>

        <nav className="flex flex-col items-center gap-3 md:items-end">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-100"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div
        className="relative border-y border-white/5 py-5"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className={`flex w-max items-center gap-14 ${reduce ? "" : "auth-marquee"}`}>
          {[...marqueeBanks, ...marqueeBanks].map((bank, i) => (
            <div key={`${bank}-${i}`} className="flex shrink-0 items-center gap-2 opacity-50">
              <BankLogo bank={bank} size={22} />
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-zinc-600 sm:flex-row sm:px-6">
        <span>© {year} TicoFinanza. Hecho en Costa Rica 🇨🇷</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} weight="bold" className="text-sky-400" />
          Solo lectura de correos bancarios. Nunca vendemos tus datos.
        </span>
      </div>
    </motion.footer>
  );
}
