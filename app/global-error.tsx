"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="es">
      <body style={{ background: "#09090b", color: "#fafafa" }}>
        <main
          style={{
            display: "flex",
            minHeight: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "0 1.5rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p style={{ fontSize: "1rem", fontWeight: 500 }}>Hubo un error.</p>
          <p style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>Volvé a intentarlo.</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "0.5rem",
              borderRadius: "9999px",
              background: "#38bdf8",
              color: "#09090b",
              fontWeight: 600,
              fontSize: "0.875rem",
              padding: "0.625rem 1.25rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
