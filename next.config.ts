import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (vía pdfjs-dist) resuelve su worker con requires dinámicos que
  // el bundler de Next rompe; se deja fuera del bundle para que corra tal
  // cual como en Node.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  images: {
    remotePatterns: [{ hostname: "lh3.googleusercontent.com" }],
  },
};

export default nextConfig;
