"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface FloatingNumberProps {
  number: number;
  x: number;
  y: number;
  type: "xp" | "coins";
}

export default function FloatingNumber({
  number,
  x,
  y,
  type,
}: FloatingNumberProps) {
  // Only render in browser environment
  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: -100,
        scale: [0.5, 1.5, 1.5, 1],
      }}
      transition={{
        duration: 1.5,
        ease: "easeOut",
        times: [0, 0.2, 0.8, 1],
      }}
      className="fixed pointer-events-none z-[100] font-bold text-xl whitespace-nowrap drop-shadow-lg"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        animate={{
          rotate: [-2, 2, -2, 2, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: 2,
        }}
        className={`px-3 py-1.5 rounded-full ${
          type === "xp"
            ? "bg-yellow-500/90 text-yellow-900"
            : "bg-amber-600/90 text-amber-100"
        }`}
      >
        {type === "xp" ? `+${number} XP ⭐` : `+${number} 🪙`}
      </motion.div>
    </motion.div>,
    document.body
  );
}
