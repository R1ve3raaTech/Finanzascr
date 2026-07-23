"use client";

import { useEffect } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center">
      <p className="text-base font-medium text-zinc-100">Hubo un error.</p>
      <p className="text-sm text-zinc-500">Volvé a intentarlo.</p>
      <button
        onClick={() => reset()}
        className="mt-2 flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 cursor-pointer"
      >
        <ArrowClockwise size={16} weight="bold" />
        Reintentar
      </button>
    </main>
  );
}
