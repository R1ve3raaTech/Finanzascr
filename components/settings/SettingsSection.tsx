import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";

/**
 * Los íconos de Ajustes eran un arcoíris (violeta para perfil, ámbar para
 * categorías, verde para moneda...) donde ningún color quería decir nada — y
 * encima le robaba significado al verde/rosa/ámbar, que en el resto de la app
 * son ingreso/gasto/alerta. Ahora son neutros y solo se tiñen al pasar el
 * mouse; el único color reservado acá es el de la zona de peligro.
 */
const TONES = {
  neutral: "bg-surface-raised text-ink-2 group-hover:bg-accent/10 group-hover:text-accent",
  danger: "bg-expense/10 text-expense",
} as const;

export function SettingsSection({
  icon: IconComponent,
  tone = "neutral",
  children,
}: {
  icon: Icon;
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <section className="group rounded-2xl border border-line bg-surface/40 p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${TONES[tone]}`}
        >
          <IconComponent size={18} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
