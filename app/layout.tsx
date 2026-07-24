import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TicoFinanza | Todas tus entidades bancarias y tu dinero en un solo lugar",
  description:
    "Lee automáticamente tus correos de BAC, BCR, Banco Nacional, Banco Popular, Davivienda, MUCAP y PayPal. Controlá tus finanzas sin mover un solo dedo. Hecho para Costa Rica.",
  appleWebApp: { title: "TicoFinanza" },
  icons: { apple: "/icon-192.png" },
};

export const viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
