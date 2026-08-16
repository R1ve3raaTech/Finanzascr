import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TicoFinanza",
    short_name: "TicoFinanza",
    description: "Tus finanzas en Costa Rica, automáticas.",
    start_url: "/dashboard",
    display: "standalone",
    // Mismo valor que --ground en globals.css: si no coinciden, se ve un
    // corte de color entre la barra del sistema y la app instalada.
    background_color: "#08090c",
    theme_color: "#08090c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
