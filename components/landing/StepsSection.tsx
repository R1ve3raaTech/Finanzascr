"use client";

import { motion, useReducedMotion } from "framer-motion";

export function StepsSection({
  heading,
  steps,
}: {
  heading: string;
  steps: { title: string; body: string }[];
}) {
  const reduce = useReducedMotion();

  return (
    <>
      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[24ch] text-3xl font-semibold tracking-tighter text-zinc-50 md:text-4xl"
      >
        {heading}
      </motion.h2>
      <div className="relative mt-14 grid gap-10 divide-y divide-white/10 md:grid-cols-3 md:gap-8 md:divide-y-0">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col gap-3 pt-6 first:pt-0 md:border-t md:border-white/10 md:pt-6"
          >
            <span className="font-mono text-sm font-semibold text-orange-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-lg font-medium text-zinc-100">{step.title}</h3>
            <p className="text-sm leading-relaxed text-zinc-400">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
}
