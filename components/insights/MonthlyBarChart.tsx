"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { formatMoney } from "@/lib/format";
import type { MonthTotal } from "@/lib/insights";

type Series = "income" | "expense";

const SERIES_LABEL: Record<Series, string> = { income: "Ingresos", expense: "Gastos" };

/**
 * Ingresos hacia arriba y gastos hacia abajo desde una línea de cero, en vez
 * de dos barras del mismo lado.
 *
 * El motivo no es estético: verde contra rojo es de los pares menos
 * distinguibles que existen para alguien con deuteranopía (~1 de cada 12
 * hombres), y en barras agrupadas el color era lo *único* que separaba una
 * serie de la otra. Poniéndolas a lados opuestos, quien identifica es la
 * posición y el color pasa a ser refuerzo. De paso el gráfico contesta de un
 * vistazo lo que uno realmente quiere saber: si el mes cerró para arriba o
 * para abajo.
 */
export function MonthlyBarChart({ data }: { data: MonthTotal[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<{ i: number; series: Series } | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 text-xs text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-chart-income" /> {SERIES_LABEL.income}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-chart-expense" /> {SERIES_LABEL.expense}
        </span>
      </div>

      <div className="relative flex justify-between gap-2 sm:gap-3">
        {/* Eje de cero, continuo de lado a lado. Va en una sola pieza y no una
            por columna: cortado en pedazos deja de leerse como eje. Se apoya
            en que el área de ingresos mide exactamente h-16. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-16 z-0 h-px bg-line-strong"
        />
        {data.map((d, i) => {
          const net = d.income - d.expense;
          return (
            <div key={d.monthKey} className="relative z-10 flex min-w-0 flex-1 flex-col items-center">
              {(["income", "expense"] as const).map((series) => {
                const value = d[series];
                const isActive = active?.i === i && active.series === series;
                const up = series === "income";
                return (
                  <div key={series} className="relative w-full">
                    {/* El área sensible cubre la columna entera, no solo la
                        barra: apuntarle a una barra de 3 píxeles con el dedo
                        es imposible. */}
                    <button
                      type="button"
                      onMouseEnter={() => setActive({ i, series })}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive({ i, series })}
                      onBlur={() => setActive(null)}
                      onClick={() =>
                        setActive((cur) =>
                          cur?.i === i && cur.series === series ? null : { i, series }
                        )
                      }
                      aria-label={`${SERIES_LABEL[series]} de ${d.label}: ${formatMoney(value)}`}
                      className={`flex h-16 w-full cursor-pointer flex-col items-center rounded-sm transition-colors hover:bg-ink/[0.04] ${
                        up ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* La barra es angosta a propósito y no ocupa toda la
                          columna: pegadas unas con otras se leían como un
                          bloque de color en vez de como barras. El área
                          clickable sí es toda la columna. */}
                      <motion.span
                        initial={reduce ? false : { scaleY: 0 }}
                        animate={{ scaleY: value > 0 ? Math.max(value / max, 0.02) : 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 26 }}
                        style={{ transformOrigin: up ? "bottom" : "top" }}
                        className={`block h-full w-full max-w-[18px] ${
                          up
                            ? "rounded-t-[3px] bg-chart-income"
                            : "rounded-b-[3px] bg-chart-expense"
                        } ${isActive ? "opacity-100" : "opacity-85"}`}
                      />
                    </button>

                    {isActive && (
                      <div
                        className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-surface-raised px-2 py-1 text-[11px] font-medium text-ink shadow-lg ${
                          up ? "bottom-full mb-1.5" : "top-full mt-1.5"
                        }`}
                      >
                        {formatMoney(value)}
                      </div>
                    )}

                  </div>
                );
              })}

              <span className="mt-2 truncate text-[11px] capitalize text-ink-3">{d.label}</span>
              <span
                className={`money text-[10px] tabular-nums ${
                  net >= 0 ? "text-income" : "text-expense"
                }`}
              >
                {net >= 0 ? "+" : "−"}
                {Math.abs(Math.round(net / 1000))}k
              </span>
            </div>
          );
        })}
      </div>

      {/* Los mismos datos en tabla, para lectores de pantalla y para quien no
          pueda leer el gráfico. */}
      <table className="sr-only">
        <caption>Ingresos y gastos en colones por mes</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">{SERIES_LABEL.income}</th>
            <th scope="col">{SERIES_LABEL.expense}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.monthKey}>
              <th scope="row">{d.label}</th>
              <td>{formatMoney(d.income)}</td>
              <td>{formatMoney(d.expense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
