"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { WarningCircle } from "@phosphor-icons/react";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;

/**
 * Confirmación destructiva reusable, como diálogo propio (no un texto que
 * reemplaza el contenido de otro modal) — se monta en un portal a <body>
 * para no depender del árbol donde se la use (ver nota en GoalModal sobre
 * ancestros con `transform` rompiendo `position: fixed`), y queda por
 * encima de cualquier otro modal abierto.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Sí, eliminar",
  cancelLabel = "Cancelar",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const reduce = useReducedMotion();
  useLockBodyScroll(open);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pending && onCancel()}
            className="fixed inset-0 z-[70] bg-ground/70 backdrop-blur-sm"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            transition={spring}
            className="fixed inset-x-4 top-1/2 z-[70] mx-auto max-w-xs -translate-y-1/2 rounded-2xl border border-rose-400/20 bg-surface p-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] sm:inset-x-0"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-400/10">
                <WarningCircle size={22} weight="bold" className="text-rose-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">{title}</h2>
                {description && (
                  <p className="mt-1 text-xs text-ink-3">{description}</p>
                )}
              </div>
              <div className="mt-1 grid w-full grid-cols-2 gap-2">
                <button
                  onClick={onCancel}
                  disabled={pending}
                  className="rounded-xl border border-line py-2.5 text-sm font-medium text-ink-2 transition-colors hover:border-white/20 hover:text-ink disabled:opacity-50 cursor-pointer"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={pending}
                  className="rounded-xl bg-rose-400 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:bg-rose-300 disabled:opacity-50 cursor-pointer"
                >
                  {pending ? "..." : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
