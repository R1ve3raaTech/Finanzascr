import type { ReactNode } from "react";

/**
 * Agrupa varias SettingsSection bajo un label ("Cuenta", "Dinero", ...) para
 * que la página de Ajustes se lea como categorías con jerarquía en vez de
 * una lista plana de tarjetas idénticas una tras otra.
 */
export function SettingsGroup({
  label,
  delayMs = 0,
  children,
}: {
  label: string;
  delayMs?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="animate-fade-up flex flex-col gap-3"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
