"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  title?: string;
}

export default function Confetti({ title }: ConfettiProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        setVisible(false);
        return;
      }

      const particleCount = 40; // Reduced particle count
      const spread = 70; // Reduced spread

      confetti({
        particleCount,
        spread,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: randomInRange(0.1, 0.9),
        },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#98FB98", "#87CEEB"],
        disableForReducedMotion: true,
      });
    }, 750); // Increased interval speed

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return title ? (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[80]">
      <div
        className={`text-${
          title.includes(" ") ? "6xl" : "5xl"
        } font-bold text-yellow-600 animate-fade-out text-center`}
        style={{
          textShadow: `
            0 0 3px #fff,
            0 0 5px #fff,
            0 0 10px #fff,
            0 0 20px #FFD700,
            0 0 40px #FFD700,
            0 0 50px #FFD700,
            0 0 60px #FFD700,
            0 0 75px #FFD700
          `,
          animation: "fadeOut 5s ease-in-out forwards",
        }}
      >
        {title}
      </div>
    </div>
  ) : null;
}
