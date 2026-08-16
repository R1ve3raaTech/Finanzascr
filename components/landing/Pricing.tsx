"use client";

import { CreditCard, HandCoins, ShieldCheck } from "@phosphor-icons/react";
import { LoginButton } from "./LoginButton";
import { Reveal } from "./Reveal";

/**
 * "¿Es gratis y cuál es la trampa?" es la primera pregunta de cualquiera que
 * entra, y la landing no la contestaba en ningún lado. Se responde de frente,
 * incluida la parte incómoda (no hay plan pago hoy, y si algún día lo hay se
 * avisa antes) — esconderlo es lo que hace que un producto de plata se sienta
 * sospechoso.
 */
const promises = [
  {
    icon: CreditCard,
    title: "Sin tarjeta",
    body: "No se pide ningún medio de pago para entrar ni para usarla.",
  },
  {
    icon: HandCoins,
    title: "Sin vender tus datos",
    body: "El modelo no es tu información. Tus movimientos no se le pasan a nadie.",
  },
  {
    icon: ShieldCheck,
    title: "Sin letra chiquita",
    body: "Si algún día hay un plan pago, se avisa antes y lo que ya usás no se cierra de un día para otro.",
  },
];

export function Pricing({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Reveal className="flex flex-col items-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Precio</p>
        <p className="mt-5 font-montserrat text-6xl font-bold leading-none tracking-tighter text-ink sm:text-7xl">
          Gratis
        </p>
        <p className="mt-5 max-w-[44ch] text-sm leading-relaxed text-ink-2 sm:text-base">
          TicoFinanza no cobra nada hoy. Es un proyecto hecho en Costa Rica, para resolver un
          problema que el que lo hizo también tenía.
        </p>
      </Reveal>

      <div className="mt-12 grid w-full max-w-3xl gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {promises.map((promise, i) => (
          <Reveal key={promise.title} delay={i * 0.06} className="bg-ground">
            <div className="flex h-full flex-col items-center justify-center gap-2.5 p-6 text-center">
              <promise.icon size={20} weight="bold" className="text-accent" />
              <h3 className="text-[15px] font-medium text-ink">{promise.title}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{promise.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15} className="mt-12">
        <LoginButton large loggedIn={loggedIn} />
      </Reveal>
    </div>
  );
}
