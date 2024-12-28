"use client";

import { CROPS } from "@/app/context/GameContext";
import { CropType } from "@/app/types/game";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import Image from "next/image";

interface FloatingNumberProps {
  number: number;
  x: number;
  y: number;
  type: "xp" | "coins" | "crop";
  cropType?: CropType;
}

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
    if (type === "crop" && cropType) return "bg-green-500/90 text-green-100";
    return "";
  };

  const getContent = () => {
    if (type === "xp") return `+${number} XP ⭐`;
    if (type === "coins") return `+${number} 🪙`;
    if (type === "crop" && cropType) {
      const crop = CROPS.find((crop) => crop.type === cropType)!;
      return (
        <>
          +{number} {cropType.toUpperCase()}{" "}
          <Image
            src={crop.icon}
            alt={cropType}
            width={16}
            height={16}
            className="inline-block"
          />
        </>
      );
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
