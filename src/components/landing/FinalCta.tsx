"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function FinalCta({ title, desc, button }: { title: string; desc: string; button: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      className="py-24 px-6 text-center relative overflow-hidden"
      initial={reduce ? undefined : { opacity: 0 }}
      whileInView={reduce ? undefined : { opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(234,88,12,0.15), transparent 70%)" }}
        initial={reduce ? undefined : { scale: 0.8, opacity: 0 }}
        whileInView={reduce ? undefined : { scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <div className="max-w-2xl mx-auto relative">
        <h2 className="text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>{desc}</p>
        <motion.div className="inline-block" whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
          <Link
            href="/register"
            className="inline-block px-10 py-4 rounded-2xl text-white font-bold text-lg"
            style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", boxShadow: "0 8px 30px rgba(234,88,12,0.3)" }}
          >
            {button}
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
