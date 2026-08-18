"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Desktop, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { updateTheme } from "@/app/dashboard/settings/actions";
import { useToast } from "@/components/Toast";
import type { Theme } from "@/lib/types";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

const OPTIONS: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Desktop },
];

export function ThemeSetting({ initial }: { initial: Theme }) {
  const reduce = useReducedMotion();
  const toast = useToast();
  const { setTheme } = useTheme();
  const [theme, setLocalTheme] = useState<Theme>(initial);
  const [pending, startTransition] = useTransition();

  function pick(t: Theme) {
    if (t === theme) return;
    setLocalTheme(t);
    setTheme(t);
    startTransition(async () => {
      await updateTheme(t);
      toast.success(`Tema: ${OPTIONS.find((o) => o.value === t)!.label}`);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium text-ink">Tema</h3>
        <p className="text-xs text-ink-3">Cómo se ve la app en este dispositivo.</p>
      </div>
      <div className="flex rounded-xl border border-line p-1">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <motion.button
            key={value}
            onClick={() => pick(value)}
            disabled={pending}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            transition={tap}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
              theme === value ? "bg-surface-raised text-ink" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            <Icon size={14} weight="bold" />
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
