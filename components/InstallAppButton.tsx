"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DownloadSimple, X } from "@phosphor-icons/react";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
const spring = { type: "spring", stiffness: 300, damping: 28 } as const;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAlreadyInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari en iOS no soporta display-mode: standalone en matchMedia de
    // forma confiable; expone esta propiedad propia en su lugar.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Botón para instalar la PWA, oculto por defecto y visible solo cuando de
 * verdad hay algo que hacer: Chrome/Edge/Android disparan `beforeinstallprompt`
 * y ese evento es lo que dispara el prompt nativo del navegador. Safari en
 * iOS nunca dispara ese evento (no lo soporta), así que ahí el botón se
 * muestra igual pero abre instrucciones a mano en vez de intentar un prompt
 * que ese navegador nunca va a dar. Si la app ya está instalada (se abrió en
 * modo standalone), el botón no se muestra en ningún navegador.
 */
export function InstallAppButton({ showLabel = false }: { showLabel?: boolean }) {
  const reduce = useReducedMotion();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [promptable, setPromptable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  // El servidor no sabe si el navegador es iOS ni si la app ya está
  // instalada — leerlo durante el primer render (aunque sea en un lazy
  // initializer de useState) haría que ese primer render en el cliente no
  // coincida con el HTML que mandó el servidor. useSyncExternalStore da
  // `false` en el servidor y en el primer render del cliente (que tienen
  // que coincidir sí o sí), y recién en el siguiente render del cliente
  // pasa a reflejar el valor real — mismo patrón que en NotificationsSetting.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const ios = mounted && isIosDevice();
  const alreadyInstalled = mounted && isAlreadyInstalled();

  useEffect(() => {
    if (!mounted || alreadyInstalled || ios) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPromptable(true);
    }
    function handleAppInstalled() {
      setDismissed(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [mounted, alreadyInstalled, ios]);

  async function handleClick() {
    if (ios) {
      setShowIosHint(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") setDismissed(true);
  }

  const visible = !alreadyInstalled && !dismissed && (ios || promptable);
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
