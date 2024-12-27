"use client";

import { CropType } from "@/app/types/game";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface FloatingNumberProps {
  number: number;
  x: number;
  y: number;
  type: "xp" | "coins" | "crop";
  cropType?: CropType;
}

const CROP_COLORS = {
  wheat: "bg-green-500/90 text-green-100",
  corn: "bg-yellow-500/90 text-yellow-900",
  tomato: "bg-red-500/90 text-red-100",
  potato: "bg-amber-500/90 text-amber-100",
};

export default function FloatingNumber({
  number,
  x,
  y,
  type,
  cropType,
}: FloatingNumberProps) {
  // Only render in browser environment
  if (typeof document === "undefined") return null;

  const getBackgroundColor = () => {
    if (type === "xp") return "bg-yellow-500/90 text-yellow-900";
    if (type === "coins") return "bg-amber-600/90 text-amber-100";
    if (type === "crop" && cropType) return CROP_COLORS[cropType];
    return "";
  };

  const getContent = () => {
    if (type === "xp") return `+${number} XP ⭐`;
    if (type === "coins") return `+${number} 🪙`;
    if (type === "crop") {
      const cropIcons = {
        wheat: "🌾",
        corn: "🌽",
        tomato: "🍅",
        potato: "🥔",
      };
      return `+${number} ${
        cropType && `${cropType.toUpperCase()} ${cropIcons[cropType]}`
      }`;
    }
    return "";
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: type === "crop" ? -30 : -80,
        scale: [0.5, 1.2, 1.2, 1],
      }}
      transition={{
        duration: 1.5,
        ease: "easeOut",
        times: [0, 0.2, 0.8, 1],
        delay: type === "crop" ? 0.2 : 0,
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
        className={`px-3 py-1.5 rounded-full ${getBackgroundColor()}`}
      >
        {getContent()}
      </motion.div>
    </motion.div>,
    document.body
  );
}
