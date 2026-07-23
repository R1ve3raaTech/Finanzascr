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
    return (
      <div
        title={brand.label}
        style={{ width: size, height: size, background: brand.chipBg ?? "#ffffff" }}
        className="flex shrink-0 items-center justify-center rounded-full p-1.5"
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
