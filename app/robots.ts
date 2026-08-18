import type { MetadataRoute } from "next";

/**
 * /dashboard, /bienvenida y /auth requieren sesión (redirigen a "/" sin
 * ella) — indexarlos no serviría de nada y le da a Google menos páginas
 * reales que rastrear.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/bienvenida", "/auth", "/api"],
    },
    sitemap: "https://www.ticofinanza.com/sitemap.xml",
  };
}
