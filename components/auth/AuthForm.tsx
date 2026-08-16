"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Info, LockKey, ShieldCheck } from "@phosphor-icons/react";
import { GoogleMark } from "@/components/GoogleMark";
import { signInWithGoogle } from "@/lib/supabase/client";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function AuthForm() {
  const reduce = useReducedMotion();

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="font-montserrat text-3xl font-bold tracking-tighter text-ink">
          Entrá a tu cuenta
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Con tu cuenta de Google activás la lectura automática de tus correos bancarios.
        </p>
      </div>

      <motion.button
        onClick={() => signInWithGoogle()}
        whileHover={reduce ? undefined : { scale: 1.01 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={tap}
        className="inline-flex items-center justify-center gap-3 rounded-xl border border-line bg-surface py-3.5 text-sm font-medium text-ink transition-colors hover:border-line-strong cursor-pointer"
      >
        <GoogleMark size={20} />
        Continuar con Google
      </motion.button>

      <div className="flex flex-col gap-2.5 text-xs text-ink-3">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck size={14} weight="bold" className="shrink-0 text-accent" />
          Gratis, sin tarjeta. Si es tu primera vez, la cuenta se crea sola.
        </span>
        <span className="inline-flex items-center gap-2">
          <LockKey size={14} weight="bold" className="shrink-0 text-accent" />
          Solo lectura de tus correos. Nunca pedimos la clave de tu banco.
        </span>
      </div>

      {/* Google le muestra "app no verificada" a las cuentas nuevas mientras
          dura la revisión del permiso de Gmail. Avisarlo acá, justo antes del
          clic, es la diferencia entre que la persona siga adelante o piense
          que la app es trucha y se vaya. Esconderlo no lo hace desaparecer:
          lo ve igual, pero sin contexto. */}
      <div className="flex gap-2.5 rounded-xl border border-line bg-surface/60 p-3.5">
        <Info size={15} weight="bold" className="mt-0.5 shrink-0 text-ink-3" />
        <p className="text-xs leading-relaxed text-ink-3">
          Google te va a mostrar un aviso de{" "}
          <span className="text-ink-2">&ldquo;app no verificada&rdquo;</span>. Es porque leer
          Gmail requiere una revisión de seguridad que TicoFinanza está haciendo ahora mismo.
          Podés continuar, y quitarle el acceso cuando querás desde tu cuenta de Google.{" "}
          <Link
            href="/#preguntas"
            className="text-accent underline-offset-4 transition-colors hover:text-accent-soft hover:underline"
          >
            Más detalles
          </Link>
        </p>
      </div>
    </div>
  );
}
