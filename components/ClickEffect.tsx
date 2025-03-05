"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ClickPosition = {
  id: number;
  x: number;
  y: number;
};

type ParticleProps = {
  x: number;
  y: number;
  angle: number;
  size: number;
  color: string;
  delay?: number;
};

// Single soil particle component
const SoilParticle: React.FC<ParticleProps> = ({
  x,
  y,
  angle,
  size,
  color,
  delay = 0,
}) => {
  // Reduce distance for shorter radius
  const distance = Math.random() * 60 + 20; // Previously 100+40, now 60+20

  return (
    <motion.div
      className="absolute rounded-md" // Changed to rounded-md for a more soil-like shape
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundColor: color,
        zIndex: 100,
        originX: "50%",
        originY: "50%",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.3)", // Add shadow for more depth
      }}
      initial={{ scale: 0, opacity: 0.9, rotate: 0 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: Math.random() * 0.8 + 0.6, // Larger scale factor
        rotate: Math.random() * 180 - 90, // Add rotation for more dynamic movement
      }}
      transition={{
        duration: Math.random() * 0.4 + 0.3, // Faster animation (was 0.8+0.7)
        ease: "easeOut",
        delay: delay, // Stagger the particles
      }}
    />
  );
};

// Flash effect at click position
const ClickFlash: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: x,
        top: y,
        width: 30,
        height: 30,
        backgroundColor: "rgba(255, 255, 220, 0.7)",
        zIndex: 99,
        marginLeft: -15,
        marginTop: -15,
      }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 1.5, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }} // Faster flash (was 0.4)
    />
  );
};

export default function ClickEffect() {
  const [clickPositions, setClickPositions] = useState<ClickPosition[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const x = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

      setClickPositions((prev) => [...prev, { id: nextId, x, y }]);
      setNextId((prev) => prev + 1);

      // Clean up this click position after animation completes
      setTimeout(() => {
        setClickPositions((prev) => prev.filter((pos) => pos.id !== nextId));
      }, 800); // Reduced cleanup time (was 1500) to match faster animations
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [nextId]);

  // Enhanced soil colors with more contrast and variety
  const soilColors = [
    "#5E4B39", // dark brown
    "#6D5A4B", // medium brown
    "#8B7D6B", // light brown
    "#4D3B2C", // very dark brown
    "#A98E6B", // tan
    "#8B4513", // saddle brown
    "#CD853F", // peru (lighter brown)
    "#D2B48C", // tan (even lighter)
  ];

  return (
    <AnimatePresence>
      {clickPositions.map((pos) => (
        <div
          key={pos.id}
          className="absolute pointer-events-none"
          style={{ left: 0, top: 0, zIndex: 9999 }}
        >
          {/* Add flash effect */}
          <ClickFlash
            x={pos.x}
            y={pos.y}
          />

          {/* Generate more particles per click (15-20) */}
          {Array.from({ length: Math.floor(Math.random() * 6) + 15 }).map(
            (_, i) => {
              const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.8;
              const size = Math.random() * 12 + 4; // Larger particles (4-16px)
              const color =
                soilColors[Math.floor(Math.random() * soilColors.length)];
              const delay = i < 5 ? 0 : Math.random() * 0.1; // Slight delay for some particles

              return (
                <SoilParticle
                  key={`${pos.id}-${i}`}
                  x={pos.x}
                  y={pos.y}
                  angle={angle}
                  size={size}
                  color={color}
                  delay={delay}
                />
              );
            }
          )}

          {/* Add a few larger "dirt clumps" */}
          {Array.from({ length: 4 }).map((_, i) => (
            <SoilParticle
              key={`${pos.id}-clump-${i}`}
              x={pos.x}
              y={pos.y}
              angle={Math.random() * Math.PI * 2}
              size={Math.random() * 12 + 10} // 10-22px larger pieces
              color={soilColors[Math.floor(Math.random() * 3)]} // Use darker colors
              delay={0.05}
            />
          ))}
        </div>
      ))}
    </AnimatePresence>
  );
}
