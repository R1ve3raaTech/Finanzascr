"use client";

import { useEffect } from "react";

/**
 * Registra el service worker apenas carga la página (no solo cuando se
 * activan las notificaciones), para que Chrome/Edge ofrezcan "Instalar app"
 * de forma confiable — varios navegadores solo muestran el prompt de
 * instalación si hay un service worker activo.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
