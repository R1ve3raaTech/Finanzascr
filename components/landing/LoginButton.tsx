"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SquaresFour } from "@phosphor-icons/react";
import { GoogleMark } from "@/components/GoogleMark";

const MotionLink = motion.create(Link);

export function LoginButton({
  large = false,
  loggedIn = false,
}: {
  large?: boolean;
  loggedIn?: boolean;
}) {
  const reduce = useReducedMotion();

  const fullLabel = loggedIn ? "Ir al dashboard" : "Iniciar sesión con Google";
  // En el header de un teléfono, "Iniciar sesión con Google" no cabe en una
  // línea: partía el botón en dos y le comía el espacio al logo. Ahí va la
  // versión corta — el botón grande del hero, que sí tiene ancho, mantiene el
  // texto completo.
  const shortLabel = loggedIn ? "Dashboard" : "Entrar";

  return (
    <MotionLink
      href={loggedIn ? "/dashboard" : "/entrar"}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full bg-zinc-50 font-medium text-zinc-900 shadow-[0_8px_30px_rgba(56,189,248,0.12)] transition-shadow hover:shadow-[0_8px_40px_rgba(56,189,248,0.2)] cursor-pointer ${
        large ? "gap-3 px-7 py-3.5 text-base" : "px-4 py-2.5 text-sm sm:px-5"
      }`}
    >
      {loggedIn ? (
        <SquaresFour size={large ? 20 : 18} weight="bold" className="text-accent-deep" />
      ) : (
        <GoogleMark size={large ? 20 : 18} />
      )}
      {large ? (
        fullLabel
      ) : (
        <>
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{fullLabel}</span>
        </>
      )}
    </MotionLink>
  );
}
