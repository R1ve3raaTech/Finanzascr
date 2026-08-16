"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DownloadSimple, X } from "@phosphor-icons/react";
import { useInstallPrompt } from "./InstallPromptProvider";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
const spring = { type: "spring", stiffness: 300, damping: 28 } as const;

/**
 * Botón para instalar la PWA. El estado de "hay algo que ofrecer" vive en
 * InstallPromptProvider (montado una sola vez en el layout raíz) — este
 * componente solo lo lee y dibuja, así que aparece igual sin importar en
 * cuántos lugares se use ni cuántas veces se remonte por navegación (ver
 * ese archivo para el porqué). En iOS abre un modal con instrucciones a
 * mano en vez de intentar el prompt nativo, que ese navegador no soporta.
 */
export function InstallAppButton({ showLabel = false }: { showLabel?: boolean }) {
  const reduce = useReducedMotion();
  const { visible, ios, promptInstall } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  async function handleClick() {
    if (ios) {
      setShowIosHint(true);
      return;
    }
    await promptInstall();
  }

  if (!visible) return null;

  return (
    <>
      <motion.button
        onClick={handleClick}
        aria-label="Instalar TicoFinanza"
        whileHover={reduce ? undefined : { scale: 1.05 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={tap}
        className={
          showLabel
            ? "flex h-8 items-center gap-1.5 rounded-full border border-line px-2.5 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink cursor-pointer sm:px-3"
            : "flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface hover:text-ink cursor-pointer"
        }
      >
        <DownloadSimple size={showLabel ? 14 : 18} weight="bold" />
        {showLabel && <span>Instalar</span>}
      </motion.button>

      <AnimatePresence>
        {showIosHint && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIosHint(false)}
              className="fixed inset-0 z-50 bg-ground/70 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Instalar TicoFinanza en iPhone"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
              transition={spring}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 sm:inset-x-0"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-base font-semibold text-ink">Instalar en iPhone</h2>
                <button
                  onClick={() => setShowIosHint(false)}
                  aria-label="Cerrar"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-raised hover:text-ink cursor-pointer"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
              <ol className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-ink-2">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-semibold text-ink">
                    1
                  </span>
                  <span>
                    Tocá el ícono de <span className="font-medium text-ink">Compartir</span>,
                    abajo en Safari.
                    <span className="block text-xs text-ink-3">
                      Es el cuadrado con la flecha hacia arriba.
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-semibold text-ink">
                    2
                  </span>
                  <span>
                    Elegí{" "}
                    <span className="font-medium text-ink">
                      &ldquo;Agregar a pantalla de inicio&rdquo;
                    </span>
                    .
                  </span>
                </li>
              </ol>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
