import { useMemo } from "react";
import { motion } from "framer-motion";

interface FarmersPowerSpeedometerProps {
  stage: number;
  width?: number;
  height?: number;
}

export const FarmersPowerSpeedometer = ({
  stage = 1,
  width = 60,
  height = 45,
}: FarmersPowerSpeedometerProps) => {
  const color = useMemo(() => {
    // Color gradient from yellow to red based on stage (1-24)
    const normalizedStage = Math.min(Math.max(stage - 1, 0), 23) / 23; // 0 to 1
    const r = 255;
    const g = Math.round(255 * (1 - normalizedStage));
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }, [stage]);

  // Calculate the angle for the needle based on stage
  const needleRotation = useMemo(() => {
    const normalizedStage = Math.min(Math.max(stage - 1, 0), 23) / 23;
    return -90 + 180 * normalizedStage; // -90 to 90 degrees
  }, [stage]);

  // Calculate intensity of pulsing effects based on stage
  const pulseIntensity = useMemo(() => {
    // Higher stage = more intense pulsing
    return Math.min(0.5 + (stage / 24) * 0.5, 1);
  }, [stage]);

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Speedometer background */}
      <path
        d="M 8 20 A 22 22 0 1 1 52 20"
        fill="none"
        stroke="#7E4E31"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Colored arc based on stage */}
      <motion.path
        d="M 8 20 A 22 22 0 1 1 52 20"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="103.7"
        strokeDashoffset={103.7 * (1 - Math.min(stage / 24, 1))}
        animate={{
          opacity: [1, 0.8, 1],
          strokeWidth: [5, 5 + pulseIntensity, 5],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Needle */}
      <motion.line
        x1="30"
        y1="20"
        x2="30"
        y2="-1"
        stroke="#C9A17D"
        strokeWidth="2.8"
        transform={`rotate(${needleRotation}, 30, 20)`}
        strokeLinecap="round"
        animate={{
          strokeWidth: [2.8, 3.2, 2.8],
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Center point with background for text */}
      <motion.circle
        cx="30"
        cy="20"
        r="13"
        fill="#7E4E31"
        strokeWidth="0.5"
        animate={{
          scale: [1, 1 + pulseIntensity * 0.05, 1],
        }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Stage number inside the center point */}
      <motion.text
        x="30"
        y="22"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize="11"
        fontWeight="bold"
        style={{ textShadow: "0px 0px 1px rgba(0,0,0,0.5)" }}
        animate={{
          opacity: [1, 0.9, 1],
        }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        {stage}
      </motion.text>
    </motion.svg>
  );
};
