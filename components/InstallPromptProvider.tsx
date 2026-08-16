"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptState {
  /** Hay algo que ofrecer: iOS (siempre, vía instrucciones) o ya se
   *  capturó un `beforeinstallprompt` real (Chrome/Edge/Android). */
  visible: boolean;
  ios: boolean;
  /** Dispara el prompt nativo del navegador. No hace nada en iOS — ahí el
   *  que llama tiene que mostrar sus propias instrucciones. */
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

const InstallPromptContext = createContext<InstallPromptState>({
  visible: false,
  ios: false,
  promptInstall: async () => "unavailable",
});

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
 * Dueño único del estado de "se puede instalar la PWA", montado una sola
 * vez en el layout raíz (nunca se desmonta durante la navegación).
 *
 * Antes cada botón de instalar manejaba su propio listener de
 * `beforeinstallprompt` — pero ese evento el navegador lo dispara una sola
 * vez por carga de página, y cada botón vivía adentro de un page.tsx que
 * se desmonta y remonta en cada navegación entre Dashboard/Estadísticas/
 * Ajustes. El primer botón que alcanzaba a montarse se quedaba con el
 * evento; el resto, al montarse después (o remontarse tras navegar), nunca
 * lo recibía — el botón aparecía en una página y desaparecía sin volver en
 * las demás. Centralizarlo acá lo resuelve de raíz: una sola vez se
 * escucha el evento, y todos los botones (header mobile de cada página,
 * barra lateral de escritorio) leen el mismo estado ya resuelto.
 */
export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [promptable, setPromptable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // El servidor no sabe si el navegador es iOS ni si la app ya está
  // instalada — leerlo durante el primer render (incluso en un lazy
  // initializer) desincroniza ese primer render del cliente con el HTML
  // que mandó el servidor. useSyncExternalStore da `false` en el servidor
  // y en el primer render del cliente (que tienen que coincidir sí o sí),
  // y recién en el siguiente render del cliente refleja el valor real.
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

  async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
    if (!deferredPrompt) return "unavailable";
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") setDismissed(true);
    return outcome;
  }

  const visible = !alreadyInstalled && !dismissed && (ios || promptable);

  return (
    <InstallPromptContext.Provider value={{ visible, ios, promptInstall }}>
      {children}
    </InstallPromptContext.Provider>
  );
}

export function useInstallPrompt(): InstallPromptState {
  return useContext(InstallPromptContext);
}
