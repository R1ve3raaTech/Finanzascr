import Image from "next/image";
import { Money } from "@phosphor-icons/react/dist/ssr";
import { BANK_BRAND } from "@/lib/bankBrand";
import type { BankName } from "@/lib/types";

export function BankLogo({
  bank,
  size = 40,
}: {
  bank: BankName;
  size?: number;
}) {
  const brand = BANK_BRAND[bank];

  if (bank === "Efectivo") {
    return (
      <div
        title={brand.label}
        style={{ width: size, height: size, background: brand.bg, color: brand.fg }}
        className="flex shrink-0 items-center justify-center rounded-full"
      >
        <Money size={size * 0.55} weight="fill" />
      </div>
    );
  }

  if (brand.logo) {
    // El padding tiene que ser proporcional al tamaño del círculo — un
    // padding fijo (ej. 6px) se come casi un tercio de un círculo chico de
    // 40px, dejando el logo diminuto. Con un % del tamaño, el logo siempre
    // ocupa la mayor parte del círculo sin importar en qué lugar se use.
    const padding = Math.round(size * 0.1);
    return (
      <div
        title={brand.label}
        style={{ width: size, height: size, background: brand.chipBg ?? "#ffffff", padding }}
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      >
        <Image
          src={brand.logo}
          alt={brand.label}
          width={size}
          height={size}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      title={brand.label}
      style={{
        width: size,
        height: size,
        background: brand.bg,
        color: brand.fg,
        fontSize: size * 0.34,
      }}
      className="flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight"
    >
      {brand.initials}
    </div>
  );
}
