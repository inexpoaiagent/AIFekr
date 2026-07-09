"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Building2, UserPlus, Bot } from "lucide-react";

interface Step { step: string; title: string; desc: string; }

const ICONS = [Building2, UserPlus, Bot];

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] } } };
const iconVariant: Variants = { hidden: { scale: 0.6, rotate: -15, opacity: 0 }, show: { scale: 1, rotate: 0, opacity: 1, transition: { duration: 0.4, ease: "backOut" } } };

export default function StepGrid({ steps, stepLabel }: { steps: Step[]; stepLabel: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      variants={reduce ? undefined : container}
      initial={reduce ? undefined : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
    >
      {steps.map((s, idx) => {
        const Icon = ICONS[idx];
        return (
          <motion.div key={s.step} variants={reduce ? undefined : item} className="text-center p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <motion.div variants={reduce ? undefined : iconVariant} className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(234,88,12,0.15)" }}>
              <Icon className="w-6 h-6" style={{ color: "#ea580c" }} />
            </motion.div>
            <div className="text-xs font-bold mb-2" style={{ color: "#ea580c" }}>{stepLabel} {s.step}</div>
            <h3 className="font-bold text-lg mb-2">{s.title}</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{s.desc}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
