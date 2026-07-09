"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function AnimatedNavbar({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const padding = useTransform(scrollY, [0, 120], [16, 10]);
  const bg = useTransform(scrollY, [0, 120], ["rgba(10,10,15,0.7)", "rgba(10,10,15,0.95)"]);

  return (
    <motion.nav
      initial={reduce ? undefined : { y: -40, opacity: 0 }}
      animate={reduce ? undefined : { y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        paddingTop: reduce ? 16 : padding,
        paddingBottom: reduce ? 16 : padding,
        background: reduce ? "rgba(10,10,15,0.9)" : bg,
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
    >
      {children}
    </motion.nav>
  );
}
