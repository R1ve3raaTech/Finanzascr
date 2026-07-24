"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SquaresFour } from "@phosphor-icons/react";
import { GoogleMark } from "@/components/GoogleMark";

export function LoginButton({
  large = false,
  loggedIn = false,
}: {
  large?: boolean;
  loggedIn?: boolean;
}) {
  const reduce = useReducedMotion();
  const MotionLink = motion.create(Link);

  return (
    <MotionLink
      href={loggedIn ? "/dashboard" : "/entrar"}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex items-center gap-3 rounded-full bg-zinc-50 text-zinc-950 font-medium shadow-[0_8px_30px_rgba(56,189,248,0.12)] hover:shadow-[0_8px_40px_rgba(56,189,248,0.2)] transition-shadow cursor-pointer ${
        large ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm"
      }`}
    >
      {loggedIn ? (
        <SquaresFour size={large ? 20 : 18} weight="bold" className="text-sky-500" />
      ) : (
        <GoogleMark size={large ? 20 : 18} />
      )}
      {loggedIn ? "Ir al dashboard" : "Iniciar sesión con Google"}
    </MotionLink>
  );
}
