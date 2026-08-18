"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import type { Theme } from "@/lib/types";

/**
 * Aplica la preferencia de tema guardada en la base la primera vez que el
 * usuario abre la app en un dispositivo nuevo (sin nada todavía en
 * localStorage). Si ya eligió un tema en este dispositivo, ese valor manda
 * — no lo pisa en cada carga, si no cambiarlo en un dispositivo nunca se
 * quedaría quieto en los demás.
 */
export function ThemeSync({ dbTheme }: { dbTheme: Theme }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      setTheme(dbTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
