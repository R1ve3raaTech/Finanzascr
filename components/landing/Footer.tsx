"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck } from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";

export function Footer() {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-auto overflow-hidden border-t border-white/10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent"
      />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <Logo subtitle="finanzas personales" />
          <p className="max-w-[32ch] text-sm leading-relaxed text-zinc-500">
            Tus movimientos bancarios, categorizados solos. Hecho en Costa Rica, para
            gente que no quiere anotar nada a mano.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">Producto</p>
          <Link href="/entrar" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
            Iniciar sesión
          </Link>
          <a
            href="#como-funciona"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Cómo funciona
          </a>
        </div>

        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">Legal</p>
          <Link
            href="/privacidad"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Política de privacidad
          </Link>
          <a
            href="mailto:thecamil999@gmail.com"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
          >
            thecamil999@gmail.com
          </a>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-zinc-600 sm:flex-row sm:px-6">
          <span>© {year} TicoFinanza. Hecho en Costa Rica 🇨🇷</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} weight="bold" className="text-sky-400" />
            Solo lectura de correos bancarios. Nunca vendemos tus datos.
          </span>
        </div>
      </div>
    </motion.footer>
  );
}
