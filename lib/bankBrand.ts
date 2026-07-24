import type { BankName } from "./types";

interface BankBrand {
  label: string;
  initials: string;
  bg: string;
  fg: string;
  /** Logo real. Si falta, se usa el badge de iniciales. */
  logo?: string;
  /** Color de fondo del chip del logo, para los que son blancos/monocromáticos. Por defecto blanco. */
  chipBg?: string;
}

export const BANK_BRAND: Record<BankName, BankBrand> = {
  BAC: {
    label: "BAC Credomatic",
    initials: "BAC",
    bg: "#E4002B",
    fg: "#ffffff",
    logo: "/logos/bac.png",
  },
  BCR: {
    label: "Banco de Costa Rica",
    initials: "BCR",
    bg: "#004990",
    fg: "#ffffff",
    logo: "/logos/bcr.png",
  },
  BNCR: {
    label: "Banco Nacional",
    initials: "BN",
    bg: "#FDB913",
    fg: "#1a1a1a",
    logo: "/logos/bncr.png",
  },
  Promerica: {
    label: "Promerica",
    initials: "PM",
    bg: "#EE3831",
    fg: "#ffffff",
    logo: "/logos/promerica.svg",
  },
  Davivienda: {
    label: "Davivienda",
    initials: "DV",
    bg: "#EF3340",
    fg: "#ffffff",
    logo: "/logos/davivienda.png",
  },
  BP: {
    label: "Banco Popular",
    initials: "BP",
    bg: "#F58220",
    fg: "#ffffff",
    logo: "/logos/bp.svg",
    chipBg: "#F58220",
  },
  MUCAP: {
    label: "MUCAP",
    initials: "MU",
    bg: "#7A1F2B",
    fg: "#ffffff",
    logo: "/logos/mucap.jpg",
  },
  PayPal: {
    label: "PayPal",
    initials: "PP",
    bg: "#003087",
    fg: "#ffffff",
    logo: "/logos/paypal.png",
  },
  Efectivo: { label: "Efectivo", initials: "₡", bg: "#059669", fg: "#ecfdf5" },
  Otro: { label: "Otro", initials: "?", bg: "#3f3f46", fg: "#e4e4e7" },
};
