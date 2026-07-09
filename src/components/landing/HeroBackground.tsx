"use client";

import { motion, useReducedMotion } from "framer-motion";

// Three soft, slow-drifting gradient blobs behind the hero — replaces the
// old single static radial circle. Disabled entirely for
// prefers-reduced-motion (blobs render static instead of animating).
export default function HeroBackground() {
  const reduce = useReducedMotion();

  const blobs = [
    { size: 620, x: "10%", y: "-10%", color: "#ea580c", duration: 22 },
    { size: 520, x: "70%", y: "10%", color: "#f97316", duration: 26 },
    { size: 460, x: "40%", y: "40%", color: "#c2410c", duration: 30 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            background: `radial-gradient(circle, ${b.color}55, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={
            reduce
              ? undefined
              : {
                  x: [0, 40, -20, 0],
                  y: [0, -30, 20, 0],
                  scale: [1, 1.08, 0.96, 1],
                }
          }
          transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
