"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function HeaderIconLink({
  href,
  label,
  hoverRotate = 0,
  children,
}: {
  href: string;
  label: string;
  hoverRotate?: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const MotionLink = motion.create(Link);

  return (
    <MotionLink
      href={href}
      aria-label={label}
      whileHover={reduce ? undefined : { scale: 1.08, rotate: hoverRotate }}
      whileTap={reduce ? undefined : { scale: 0.92, rotate: 0 }}
      transition={tap}
      className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
    >
      {children}
    </MotionLink>
  );
}
