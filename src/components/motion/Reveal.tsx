"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fades + slides a block into view as it enters the viewport. Pages that
 * use it stay server components (metadata export etc. keeps working) —
 * only this wrapper is client-side.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Starting vertical offset in px. */
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;