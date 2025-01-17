"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function Confetti() {
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

      const particleCount = 50;

      confetti({
        particleCount,
        spread: 70,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: randomInRange(0.1, 0.9),
        },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#98FB98", "#87CEEB"],
        disableForReducedMotion: true,
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className="text-6xl font-bold text-yellow-300 animate-fade-out text-center"
        style={{
          textShadow: `
            0 0 7px #fff,
            0 0 10px #fff,
            0 0 21px #fff,
            0 0 42px #FFD700,
            0 0 82px #FFD700,
            0 0 92px #FFD700,
            0 0 102px #FFD700,
            0 0 151px #FFD700
          `,
          animation: "fadeOut 5s ease-in-out forwards",
        }}
      >
        LEVEL UP!
      </div>
    </div>
  );
}
