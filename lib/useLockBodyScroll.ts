"use client";

import { useEffect } from "react";

// Contador global: si dos modales quedan abiertos a la vez (ej. un
// ConfirmDialog encima de otro modal), el scroll del body se destrabar solo
// cuando se cierra el último, no el primero que se cierra.
let lockCount = 0;
let previousOverflow = "";

/** Bloquea el scroll de <body> mientras `active` sea true (ej. un modal abierto). */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [active]);
}
