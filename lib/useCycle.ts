"use client";

import { useEffect, useState } from "react";

/**
 * Índice que avanza solo cada `intervalMs`, en loop. Se usa para que las
 * mini-animaciones de la landing muestren un solo estado a la vez (con
 * AnimatePresence) en vez de intentar coreografiar arrays de opacidad
 * superpuestos, que es lo que causaba que dos etiquetas se vieran
 * encimadas al mismo tiempo.
 */
export function useCycle(length: number, intervalMs: number, paused = false): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (paused || length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs, paused]);

  return index;
}
