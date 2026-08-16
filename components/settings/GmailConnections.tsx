"use client";

import { useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EnvelopeSimple, Plus, X } from "@phosphor-icons/react";
import { disconnectGmail } from "@/app/dashboard/settings/actions";
import { useToast } from "@/components/Toast";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
const pop = { type: "spring", stiffness: 420, damping: 22 } as const;

export interface GmailConnection {
  id: string;
  email: string | null;
  last_synced_at: string | null;
}

function formatLastSync(iso: string | null): string {
  if (!iso) return "Todavía no sincronizó";
  return `Última sincronización: ${new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Costa_Rica",
  }).format(new Date(iso))}`;
}

export function GmailConnections({ connections }: { connections: GmailConnection[] }) {
  const reduce = useReducedMotion();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function disconnect(id: string, email: string | null) {
    startTransition(async () => {
      await disconnectGmail(id);
      toast.success(`${email ?? "Cuenta"} desconectada`);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium text-ink">Cuentas de Gmail conectadas</h3>
        <p className="text-xs text-ink-3">
          Se leen automáticamente los correos bancarios de cada una.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {connections.length === 0 && (
          <p className="text-xs text-ink-3">No hay ninguna cuenta conectada.</p>
        )}
        <AnimatePresence initial={false}>
          {connections.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={reduce ? false : { opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={pop}
              className="flex items-center gap-3 rounded-xl border border-line bg-ground p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised">
                <EnvelopeSimple size={14} weight="bold" className="text-ink-2" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{c.email ?? "Cuenta conectada"}</p>
                <p className="text-xs text-ink-3">{formatLastSync(c.last_synced_at)}</p>
              </div>
              <motion.button
                onClick={() => disconnect(c.id, c.email)}
                disabled={pending}
                aria-label={`Desconectar ${c.email}`}
                whileTap={reduce ? undefined : { scale: 0.85 }}
                transition={tap}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-raised hover:text-rose-400 disabled:opacity-40 cursor-pointer"
              >
                <X size={14} weight="bold" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.a
        href="/auth/gmail-connect"
        whileHover={reduce ? undefined : { scale: 1.01 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={tap}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong py-2.5 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
      >
        <Plus size={14} weight="bold" />
        Conectar otra cuenta de Gmail
      </motion.a>
    </div>
  );
}
