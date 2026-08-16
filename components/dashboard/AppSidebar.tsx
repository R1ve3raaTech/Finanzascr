"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChartBar, GearSix, SquaresFour } from "@phosphor-icons/react";
import { InstallAppButton } from "@/components/InstallAppButton";
import { Logo } from "@/components/Logo";
import { ProfileAvatar } from "./ProfileAvatar";
import { SignOutButton } from "./SignOutButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/dashboard/insights", label: "Estadísticas", icon: ChartBar },
  { href: "/dashboard/settings", label: "Ajustes", icon: GearSix },
];

/**
 * Barra lateral fija de escritorio (`lg:` en adelante). En mobile no se
 * renderiza nada — cada página conserva su header angosto de siempre, que
 * ahora solo se muestra por debajo de `lg`. Nada del layout mobile cambia.
 */
export function AppSidebar({ name, avatarUrl }: { name?: string; avatarUrl?: string }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-line bg-surface/40 lg:flex">
      <div className="flex h-[68px] shrink-0 items-center px-6">
        <Link href="/dashboard" aria-label="Ir al dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-surface-raised"
                />
              )}
              <item.icon
                size={17}
                weight="bold"
                className={`relative shrink-0 ${active ? "text-accent" : ""}`}
              />
              <span className="relative truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* No renderiza nada si el navegador no puede instalar la PWA (o si ya
          está instalada) — ver InstallAppButton para el detalle. */}
      <div className="px-3 pb-1">
        <InstallAppButton showLabel />
      </div>

      <div className="flex items-center gap-2.5 border-t border-line px-4 py-4">
        <ProfileAvatar avatarUrl={avatarUrl} name={name} />
        <span className="min-w-0 flex-1 truncate text-sm text-ink-2">{name ?? "Tu cuenta"}</span>
        <SignOutButton />
      </div>
    </aside>
  );
}
