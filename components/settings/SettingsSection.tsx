import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";

const ACCENTS = {
  emerald: "bg-emerald-400/10 text-emerald-400",
  amber: "bg-amber-400/10 text-amber-400",
  accent: "bg-accent/10 text-accent",
  violet: "bg-violet-400/10 text-violet-400",
  rose: "bg-rose-400/10 text-rose-400",
  zinc: "bg-ink-2/10 text-ink-2",
} as const;

export function SettingsSection({
  icon: IconComponent,
  accent = "zinc",
  children,
}: {
  icon: Icon;
  accent?: keyof typeof ACCENTS;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface/40 p-5">
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
