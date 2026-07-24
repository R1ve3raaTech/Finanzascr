import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";

const ACCENTS = {
  emerald: "bg-emerald-400/10 text-emerald-400",
  amber: "bg-amber-400/10 text-amber-400",
  sky: "bg-sky-400/10 text-sky-400",
  violet: "bg-violet-400/10 text-violet-400",
  rose: "bg-rose-400/10 text-rose-400",
  zinc: "bg-zinc-400/10 text-zinc-300",
} as const;

export function SettingsSection({
  icon: IconComponent,
  accent = "zinc",
  delayMs = 0,
  children,
}: {
  icon: Icon;
  accent?: keyof typeof ACCENTS;
  delayMs?: number;
  children: ReactNode;
}) {
  return (
    <section
      className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${ACCENTS[accent]}`}
        >
          <IconComponent size={18} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
