import { useMemo } from "react";
import { motion } from "framer-motion";
import { POWER_STAGES } from "@/lib/game-constants";

interface FarmersPowerSpeedometerProps {
  stage: number;
  width?: number;
  height?: number;
  currentFP?: number;
}

export const FarmersPowerSpeedometer = ({
  stage = 1,
  width = 60,
  height = 45,
  currentFP,
}: FarmersPowerSpeedometerProps) => {
  const ACTUAL_PATH_LENGTH = Math.PI * 22; // Semicircle with radius 22

  // Calculate the arc progress and needle position based on FP
  const { arcProgress, needleRotation } = useMemo(() => {
    // If currentFP is not provided, default to using the stage for position
    if (currentFP === undefined) {
      const normalizedStage = Math.min(Math.max(stage - 1, 0), 23) / 23;
      return {
        arcProgress: normalizedStage,
        needleRotation: -90 + 180 * normalizedStage,
      };
    }

    // Find the current stage thresholds
    const currentStageInfo = POWER_STAGES[stage - 1];
    const nextStageInfo =
      POWER_STAGES[stage] || POWER_STAGES[POWER_STAGES.length - 1];

    // Calculate progress within current stage (like AnimatedCircularProgressBar)
    const min = currentStageInfo.fpRequired;
    const max = nextStageInfo.fpRequired;

    // Calculate how far within the current stage range we are (0-1)
    let stageProgress;
    if (max === min) {
      // Handles division by zero if min and max are the same (e.g., at the last stage)
      stageProgress = currentFP >= min ? 1 : 0;
    } else {
      stageProgress = Math.min(Math.max((currentFP - min) / (max - min), 0), 1);
    }

    // Convert stage progress to an angle between -90 and 90 degrees
    const calculatedNeedleRotation = -90 + stageProgress * 180;

    // For the colored arc, this is the progress within the stage
    const calculatedArcProgress = stageProgress;

    return {
      arcProgress: calculatedArcProgress,
      needleRotation: calculatedNeedleRotation,
    };
  }, [stage, currentFP]);

  // Calculate color based on stage and fine-grained arcProgress
  const color = useMemo(() => {
    let progressForColorCalculation: number;

    if (currentFP !== undefined) {
      // arcProgress is the progress (0-1) within the current stage.
      // Use this directly to determine color, so it transitions from yellow to red within the current stage.
      progressForColorCalculation = arcProgress;
    } else {
      // currentFP is undefined.
      // In this case, arcProgress (from the hook above) is Math.min(Math.max(stage - 1, 0), 23) / 23,
      // which is the normalized overall stage progress (0-1).
      progressForColorCalculation = arcProgress;
    }

    progressForColorCalculation = Math.min(
      Math.max(progressForColorCalculation, 0),
      1
    );

    const r = 255;
    const g = Math.round(255 * (1 - progressForColorCalculation));
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }, [arcProgress, currentFP]);

  // Calculate intensity of pulsing effects based on stage
  const pulseIntensity = useMemo(() => {
    // Base intensity of 0.6, scaling up to 1.0 with stage.
    // (stage is 1-based, assumed to be from 1 up to 24)
    // Ensures pulseIntensity is between 0.6 and 1.0.
    const normalizedStageProgress = (Math.min(Math.max(stage, 1), 24) - 1) / 23;
    return 0.6 + normalizedStageProgress * 0.4;
  }, [stage]);

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid meet"
      style={{
        filter: `drop-shadow(0 0 3px rgba(253, 224, 71, ${pulseIntensity * 0.7}))`,
      }}
      animate={{
        // Animate the filter's opacity for a pulsing aura effect
        filter: [
          `drop-shadow(0 0 3px rgba(253, 224, 71, ${pulseIntensity * 0.5}))`,
          `drop-shadow(0 0 6px rgba(253, 224, 71, ${pulseIntensity * 0.8}))`,
          `drop-shadow(0 0 3px rgba(253, 224, 71, ${pulseIntensity * 0.5}))`,
        ],
      }}
      transition={{
        duration: 1.0,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      {/* Speedometer background */}
      <path
        d="M 8 20 A 22 22 0 1 1 52 20"
        fill="none"
        stroke="#7E4E31"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Colored arc based on FP progress */}
      <motion.path
        d="M 8 20 A 22 22 0 1 1 52 20"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={ACTUAL_PATH_LENGTH.toString()}
        strokeDashoffset={
          ACTUAL_PATH_LENGTH *
          (1 -
            (currentFP !== undefined ? arcProgress : Math.min(stage / 24, 1)))
        }
        animate={{
          opacity: [1, 0.6, 1], // More pronounced opacity pulse
          strokeWidth: [5, 5 + pulseIntensity * 2, 5], // Stronger width pulse
        }}
        transition={{
          duration: 1.0, // Faster and synced
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Needle - follows the end of the colored arc */}
      <motion.line
        x1="30"
        y1="20"
        x2="30"
        y2="-1"
        stroke="#FDE047" // Lighter, golden-yellow color for better visibility
        strokeWidth="2.8"
        transform={`rotate(${needleRotation}, 30, 20)`}
        strokeLinecap="round"
        animate={{
          strokeWidth: [2.8, 2.8 + pulseIntensity * 0.7, 2.8], // Dynamic and more pronounced
        }}
        transition={{
          duration: 1.0, // Synced
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
          scale: [1, 1 + pulseIntensity * 0.12, 1], // More noticeable scale
        }}
        transition={{
          duration: 1.0, // Synced
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
          opacity: [1, 1 - pulseIntensity * 0.5, 1], // More visible opacity pulse
        }}
        transition={{
          duration: 1.0, // Synced
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
