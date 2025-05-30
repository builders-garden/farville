import { useMemo } from "react";
import { motion } from "framer-motion";
import { POWER_STAGES } from "@/lib/game-constants";

interface FarmersPowerSpeedometerProps {
  stage: number;
  width?: number;
  height?: number;
  currentFP?: number;
  isFarcasterManiaOn?: boolean;
}

export const FarmersPowerSpeedometer = ({
  stage = 1,
  width = 60,
  height = 45,
  currentFP,
  isFarcasterManiaOn = false,
}: FarmersPowerSpeedometerProps) => {
  const ACTUAL_PATH_LENGTH = Math.PI * 22; // Semicircle with radius 22
  const boost = POWER_STAGES[stage - 1]?.boost || 0;

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

    if (isFarcasterManiaOn) {
      // Farcaster Mania Mode: transition from a lighter purple to a darker purple
      // New Lighter: rgb(220, 200, 250)
      // New Darker: rgb(160, 140, 220)
      const r = Math.round(
        160 + (1 - progressForColorCalculation) * (220 - 160)
      );
      const g = Math.round(
        140 + (1 - progressForColorCalculation) * (200 - 140)
      );
      const b = Math.round(
        220 + (1 - progressForColorCalculation) * (250 - 220)
      );
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Default Mode: transition from yellow to red
      const r = 255;
      const g = Math.round(255 * (1 - progressForColorCalculation));
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    }
  }, [arcProgress, currentFP, isFarcasterManiaOn]);

  // Calculate intensity of pulsing effects based on stage
  const pulseIntensity = useMemo(() => {
    // Base intensity of 0.6, scaling up to 1.0 with stage.
    // (stage is 1-based, assumed to be from 1 up to 24)
    // Ensures pulseIntensity is between 0.6 and 1.0.
    const normalizedStageProgress = (Math.min(Math.max(stage, 1), 24) - 1) / 23;
    return 0.6 + normalizedStageProgress * 0.4;
  }, [stage]);

  const BG_SHAPE_HEIGHT = 20; // Height of the background shape

  // Set a fixed width for the background
  const currentBgWidth = 50; // Max width based on previous logic for long decimals
  const bgRectRx = BG_SHAPE_HEIGHT / 2; // Pill shape for consistency

  // Calculate x, y for the rect to be centered around text position
  const bgRectX = 30 - currentBgWidth / 2;
  const bgRectY = 26 - BG_SHAPE_HEIGHT / 2; // Y base changed from 27 to 28

  const bgRectRy = BG_SHAPE_HEIGHT / 2; // Ry is always half of the height for pill/circle

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid meet"
      style={{
        filter: `drop-shadow(0 0 3px rgba(${
          isFarcasterManiaOn ? "160, 140, 220" : "253, 224, 71"
        }, ${pulseIntensity * 0.7}))`,
      }}
      animate={{
        // Animate the filter's opacity for a pulsing aura effect
        filter: [
          `drop-shadow(0 0 3px rgba(${
            isFarcasterManiaOn ? "160, 140, 220" : "253, 224, 71"
          }, ${pulseIntensity * 0.5}))`,
          `drop-shadow(0 0 6px rgba(${
            isFarcasterManiaOn ? "160, 140, 220" : "253, 224, 71"
          }, ${pulseIntensity * 0.8}))`,
          `drop-shadow(0 0 3px rgba(${
            isFarcasterManiaOn ? "160, 140, 220" : "253, 224, 71"
          }, ${pulseIntensity * 0.5}))`,
        ],
      }}
      transition={{
        duration: 1.0,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      {/* Background for the stage number */}
      <motion.rect
        x={bgRectX}
        y={bgRectY}
        width={currentBgWidth}
        height={BG_SHAPE_HEIGHT}
        rx={bgRectRx}
        ry={bgRectRy}
        fill="#7E4E31"
        transition={{
          duration: 1.0, // Synced
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Arc background fill */}
      <path
        d="M 8 18 A 22 22 0 1 1 52 18"
        fill="#7E4E31" // Lighter brown background for the arc area
      />

      {/* Speedometer background */}
      <path
        d="M 8 18 A 22 22 0 1 1 52 18"
        fill="none"
        stroke="#7E4E31"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Tick Marks */}
      {[-90, -45, 0, 45, 90].map((angle) => {
        const rad = angle * (Math.PI / 180);
        const cx = 30;
        const cy = 18;
        const rOuter = 23;
        const rInner = 15; // Tick length of 5 (previously 19 for length 3)

        // For SVG, positive y is down. For calculations where 0 angle is 'up':
        // x = cx + r * sin(rad)
        // y = cy - r * cos(rad)
        const x1 = cx + rInner * Math.sin(rad);
        const y1 = cy - rInner * Math.cos(rad);
        const x2 = cx + rOuter * Math.sin(rad);
        const y2 = cy - rOuter * Math.cos(rad);

        return (
          <line
            key={`tick-${angle}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Colored arc based on FP progress */}
      <motion.path
        d="M 8 18 A 22 22 0 1 1 52 18"
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
        y1="18"
        x2="30"
        y2="-1"
        stroke={isFarcasterManiaOn ? "#A08CDC" : "#FDE047"} // New lighter purple: #A08CDC
        strokeWidth="2.8"
        transform={`rotate(${needleRotation}, 30, 18)`}
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

      {/* Stage number inside the center point */}
      <motion.text
        x="30"
        y="28" // Changed from 27 to 28
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize="8"
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
        {boost}x
      </motion.text>
    </motion.svg>
  );
};
