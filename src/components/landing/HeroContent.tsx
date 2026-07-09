"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export default function HeroContent({
  badge, title1, title2, desc, ctaStart, ctaViewPacks,
}: {
  badge: string; title1: string; title2: string; desc: string; ctaStart: string; ctaViewPacks: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative max-w-4xl mx-auto"
      variants={reduce ? undefined : container}
      initial={reduce ? undefined : "hidden"}
      animate={reduce ? undefined : "show"}
    >
      <motion.div
        variants={reduce ? undefined : item}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
        style={{ background: "rgba(234,88,12,0.15)", border: "1px solid rgba(234,88,12,0.3)", color: "#ea580c" }}
      >
        <motion.span
          className="w-2 h-2 rounded-full bg-orange-500"
          animate={reduce ? undefined : { opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {badge}
      </motion.div>

      <motion.h1 variants={reduce ? undefined : item} className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
        {title1}{" "}
        <span style={{ background: "linear-gradient(135deg, #ea580c, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {title2}
        </span>
      </motion.h1>

      <motion.p variants={reduce ? undefined : item} className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
        {desc}
      </motion.p>

      <motion.div variants={reduce ? undefined : item} className="flex items-center justify-center gap-4 flex-wrap">
        <motion.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
          <Link
            href="/register"
            className="block px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-shadow"
            style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", boxShadow: "0 8px 30px rgba(234,88,12,0.25)" }}
          >
            {ctaStart}
          </Link>
        </motion.div>
        <motion.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
          <Link
            href="/industry"
            className="block px-8 py-4 rounded-2xl font-semibold text-lg transition-all"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
          >
            {ctaViewPacks}
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
