"use client";

import { CropType, ItemCategory, PerkType } from "@/lib/types/game";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useGame } from "@/context/GameContext";

interface FloatingNumberProps {
  number: number;
  x: number;
  y: number;
  type: "xp" | "coins" | ItemCategory;
  slug?: CropType | PerkType;
}

interface FloatingNumberContentProps {
  type: "xp" | "coins" | ItemCategory;
  number: number;
  slug?: CropType | PerkType;
}

function FloatingNumberContent({
  type,
  number,
  slug,
}: FloatingNumberContentProps) {
  const { state } = useGame();

  const getBackgroundColor = () => {
    if (type === "xp") return "bg-yellow-500/90 text-yellow-900";
    if (type === "coins") return "bg-amber-600/90 text-amber-100";
    return "bg-green-500/90 text-green-100";
  };

  const getContent = () => {
    if (type === "xp") return `+${number} XP ⭐`;
    if (type === "coins") return `+${number} 🪙`;
    if (slug) {
      const item = state.items.find((item) => item.slug === slug)!;
      return (
        <>
          +{number} {slug.toUpperCase()}{" "}
          <Image
            src={`/images${item.icon}`}
            alt={slug}
            width={24}
            height={24}
            className="inline-block"
          />
        </>
      );
    }
    return "";
  };

  return (
    <div className={`px-3 py-1.5 rounded-full ${getBackgroundColor()}`}>
      {getContent()}
    </div>
  );
}

export default function FloatingNumber({
  number,
  x,
  y,
  type,
  slug,
}: FloatingNumberProps) {
  // Only render in browser environment
  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: type !== "xp" && type !== "coins" ? +30 : +80,
        scale: [0.5, 1.2, 1.2, 1],
      }}
      transition={{
        duration: 1.5,
        ease: "easeOut",
        times: [0, 0.2, 0.8, 1],
        delay: type !== "xp" && type !== "coins" ? 0.2 : 0,
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
      >
        <FloatingNumberContent
          type={type}
          number={number}
          slug={slug}
        />
      </motion.div>
    </motion.div>,
    document.body
  );
}
