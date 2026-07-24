import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Transaction } from "@/lib/types";

function csvEscape(value: string): string {
  // Si la celda empieza con =, +, -, @, tab o retorno de carro, Excel/Sheets
  // puede interpretarla como fórmula al abrir el CSV ("CSV injection"). Se
  // antepone un apóstrofe para que quede forzada a texto plano.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

const HEADER = [
  "Fecha",
  "Entidad",
  "Tipo",
  "Categoría",
  "Descripción",
  "Monto",
  "Moneda",
  "Automático",
];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false });

  const transactions = (data ?? []) as Transaction[];

  const rows = transactions.map((t) => [
    new Date(t.transaction_date).toLocaleString("es-CR"),
    t.bank_name,
    t.type === "INCOME" ? "Ingreso" : "Gasto",
    t.category ?? "",
    t.description ?? "",
    String(t.amount),
    t.currency,
    t.is_automated ? "Sí" : "No",
  ]);

  const csv = [HEADER, ...rows]
    .map((row) => row.map((cell) => csvEscape(cell)).join(","))
    .join("\r\n");

  return new NextResponse(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transacciones.csv"`,
    },
  });
}
