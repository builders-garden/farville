"use client";

import { motion } from "framer-motion";
import { useAudio } from "../context/AudioContext";
import { useState, useEffect } from "react";
import { GridCell as GridCellType, Crop, CropType } from "../types/game";
import CropSprite from "./CropSprite";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";
import { useFrameContext } from "../context/FrameContext";
import { CROPS } from "../context/GameContext";
import FloatingNumber from "./animations/FloatingNumber";

// Demo version of CropSprite that shows seconds instead of minutes/hours
function DemoCropSprite({ crop }: { crop?: Crop }) {
  return (
    <>
      <CropSprite crop={crop} isDemo={true} />
    </>
  );
}

// At the top of the file, add this interface
interface DemoGridCell extends GridCellType {
  justHarvested?: boolean;
  harvestAnimation?: {
    x: number;
    y: number;
    type: CropType;
    amount: number;
  };
}

// Add these interfaces at the top with other interfaces
interface TouchDragState {
  active: boolean;
  seedType: CropType | null;
  element: HTMLElement | null;
}

// Add this constant at the top with other constants
const DEMO_GROWTH_TIME = 9000; // 9 seconds total (3 seconds per stage)

// Add this constant near the top with other constants
const SEED_ANIMATION = {
  y: [0, -4, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Add this CSS constant near the top with other constants
const PIXEL_BORDER = `
  2px solid #000;
  box-shadow: 
    -4px 0 0 0 #000,
    4px 0 0 0 #000,
    0 -4px 0 0 #000,
    0 4px 0 0 #000;
`;

export default function WelcomeOverlay({ onStart }: { onStart: () => void }) {
  const { startBackgroundMusic, playSound } = useAudio();
  const [selectedSeed, setSelectedSeed] = useState<CropType | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const { safeAreaInsets } = useFrameContext();

  // Add helper function to start music
  const startMusic = () => {
    if (!musicStarted) {
      startBackgroundMusic();
      setMusicStarted(true);
    }
  };

  // Update the state type
  const [demoCells, setDemoCells] = useState<DemoGridCell[]>(
    Array(9)
      .fill(null)
      .map((_, index) => ({
        x: index % 3,
        y: Math.floor(index / 3),
        tilled: true,
        crop: undefined,
        id: `demo-${index}`,
        justHarvested: false,
      }))
  );

  // Add touch drag state
  const [touchDrag, setTouchDrag] = useState<TouchDragState>({
    active: false,
    seedType: null,
    element: null,
  });

  const handleCellClick = (index: number) => {
    startMusic();
    setDemoCells((prev) => {
      const newCells = [...prev];
      const cell = newCells[index];

      if (!cell.crop && !cell.justHarvested && selectedSeed) {
        // Plant selected crop
        playSound("plant");
        cell.crop = {
          type: selectedSeed,
          plantedAt: Date.now(),
          growthStage: 0,
          readyToHarvest: false,
          growthTime: 9000,
        };
      } else if (cell.crop?.readyToHarvest) {
        // Get cell position for animation
        const cellElement = document.querySelector(
          `[data-cell-index="${index}"]`
        );
        if (cellElement) {
          const rect = cellElement.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Add harvest animation data
          cell.harvestAnimation = {
            x: centerX,
            y: centerY,
            type: cell.crop.type,
            amount: Math.floor(Math.random() * 3) + 1, // Random amount between 1-3
          };
        }

        // Harvest the crop and keep the soil tilled
        playSound("harvest");
        cell.crop = undefined;
        cell.justHarvested = true;

        // Remove the justHarvested flag and animation after a short delay
        setTimeout(() => {
          setDemoCells((prev) => {
            const newCells = [...prev];
            const cell = newCells[index];
            cell.justHarvested = false;
            cell.harvestAnimation = undefined;
            return newCells;
          });
        }, 1500);
      }

      return newCells;
    });
  };

  const handleDragStart = (e: React.DragEvent, cropType: CropType) => {
    e.dataTransfer.setData("cropType", cropType);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    const cell = demoCells[index];
    if (!cell.crop && !cell.justHarvested) {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const cropType = e.dataTransfer.getData("cropType") as CropType;
    handlePlanting(index, cropType);
  };

  // Update growth stages
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoCells((prev) => {
        const newCells = [...prev];
        newCells.forEach((cell) => {
          if (cell.crop && !cell.crop.readyToHarvest) {
            const elapsed = Date.now() - cell.crop.plantedAt;
            // Each stage takes 3 seconds (total 9 seconds)
            const growthStage = Math.min(
              Math.floor(elapsed / (DEMO_GROWTH_TIME / 3)),
              3
            );

            cell.crop.growthStage = growthStage;
            cell.crop.readyToHarvest = growthStage === 3;
          }
        });
        return newCells;
      });
    }, 100); // Update more frequently for smoother progress bar

    return () => clearInterval(interval);
  }, []);

  // Add these handlers for touch events
  const handleTouchStart = (e: React.TouchEvent, type: CropType) => {
    const element = e.currentTarget.cloneNode(true) as HTMLElement;

    // Style the dragged element
    element.style.position = "fixed";
    element.style.pointerEvents = "none";
    element.style.zIndex = "1000";
    element.style.opacity = "0.8";
    element.style.transform = "scale(1.1)";
    document.body.appendChild(element);

    setTouchDrag({
      active: true,
      seedType: type,
      element: element,
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchDrag.active && touchDrag.element) {
      const touch = e.touches[0];
      touchDrag.element.style.left = `${touch.clientX - 28}px`; // Half of w-14
      touchDrag.element.style.top = `${touch.clientY - 28}px`; // Half of h-14
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchDrag.active && touchDrag.element) {
      const touch = e.changedTouches[0];
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);

      // Find the grid cell element under the touch point
      const cellElement = elements.find(
        (el) => el.getAttribute("data-cell-index") !== null
      );

      if (cellElement && touchDrag.seedType) {
        const cellIndex = parseInt(
          cellElement.getAttribute("data-cell-index") || "-1"
        );
        if (cellIndex >= 0) {
          handlePlanting(cellIndex, touchDrag.seedType);
        }
      }

      // Clean up
      document.body.removeChild(touchDrag.element);
      setTouchDrag({ active: false, seedType: null, element: null });
    }
  };

  // Add useEffect for touch move event
  useEffect(() => {
    if (touchDrag.active) {
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      return () => document.removeEventListener("touchmove", handleTouchMove);
    }
  }, [touchDrag.active]);

  // Extract planting logic to be reused
  const handlePlanting = (index: number, cropType: CropType) => {
    startMusic();
    setDemoCells((prev) => {
      const newCells = [...prev];
      const cell = newCells[index];

      if (!cell.crop && !cell.justHarvested) {
        playSound("plant");
        cell.crop = {
          type: cropType,
          plantedAt: Date.now(),
          growthStage: 0,
          readyToHarvest: false,
          growthTime: 9000,
        };
      }

      return newCells;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        marginTop: safeAreaInsets.top,
        marginBottom: safeAreaInsets.bottom,
        marginLeft: safeAreaInsets.left,
        marginRight: safeAreaInsets.right,
      }}
      className="fixed inset-0 w-full h-full z-[100] flex flex-col items-center justify-center gap-2 bg-black"
    >
      {/* Full-screen background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/welcome.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={100}
        />
      </div>

      {/* Semi-transparent gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />

      {/* Content container */}
      <div className="relative z-20 flex flex-col items-center gap-2 w-full max-w-md p-4">
        {/* FarVille title */}
        <div className="flex flex-col text-center items-center gap-2">
          <h1 className="text-white/90 text-4xl font-bold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            FarVille
          </h1>
          <p className="text-white/70 text-sm [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)]">
            Plant, grow, and harvest crops with frens!
          </p>
        </div>
        {/* Seed Selection Toolbar */}
        <div className="flex gap-2 mt-4">
          {CROPS.map(({ type, seedIcon, name }) => (
            <motion.div
              key={type}
              draggable
              onDragStart={(e) =>
                handleDragStart(e as unknown as React.DragEvent, type)
              }
              onTouchStart={(e) => handleTouchStart(e, type)}
              onTouchEnd={handleTouchEnd}
              onClick={() => {
                startMusic();
                setSelectedSeed(type);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={SEED_ANIMATION}
              className={`
                relative w-14 h-14 rounded-lg flex flex-col items-center justify-center cursor-pointer
                bg-[#3d7a37] border-2 touch-none group
                ${
                  selectedSeed === type
                    ? "border-yellow-400"
                    : "border-[#2d5a27]"
                }
                hover:border-yellow-400/50 transition-colors
              `}
            >
              <Image
                src={seedIcon}
                alt={name}
                width={24}
                height={24}
                className="object-contain"
              />
              <span className={`text-[6px] text-white mt-0.5`}>{name}</span>

              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Drag to plant!
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2">
          {demoCells.map((cell, index) => (
            <motion.div
              key={cell.id}
              data-cell-index={index}
              onClick={() => handleCellClick(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-20 h-20 rounded-lg relative cursor-pointer
                transition-colors duration-200
              `}
              style={{
                backgroundImage: cell.tilled ? "var(--soil-pattern)" : "none",
                backgroundSize: "4px 4px",
              }}
            >
              <DemoCropSprite crop={cell.crop} />
              {cell.harvestAnimation && (
                <FloatingNumber
                  number={cell.harvestAnimation.amount}
                  x={cell.harvestAnimation.x}
                  y={cell.harvestAnimation.y}
                  type="crop"
                  cropType={cell.harvestAnimation.type}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Presave Button */}
        <motion.button
          whileHover={{
            scale: 1.08,
            rotate: [-1, 1, -1],
            transition: {
              rotate: {
                repeat: Infinity,
                duration: 0.5,
              },
            },
          }}
          whileTap={{ scale: 0.92 }}
          animate={{
            y: [0, -10, 0],
            boxShadow: [
              "0 0 60px rgba(16,185,129,0.9), 0 0 60px rgba(34,197,94,0.8)",
              "0 0 80px rgba(16,185,129,1), 0 0 80px rgba(34,197,94,1)",
              "0 0 60px rgba(16,185,129,0.9), 0 0 60px rgba(34,197,94,0.8)",
            ],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          onClick={async () => {
            startBackgroundMusic();
            await sdk.actions.addFrame();
            onStart();
          }}
          className={`
            mt-8 px-16 py-4 
            bg-white text-emerald-600 
            rounded-none text-2xl font-bold
            hover:bg-emerald-100
            [image-rendering:pixelated]
            shadow-[0_0_60px_rgba(16,185,129,0.9),0_0_60px_rgba(34,197,94,0.8)]
            hover:shadow-[0_0_100px_rgba(16,185,129,1),0_0_100px_rgba(34,197,94,1)]
            transition-all duration-300
          `}
          style={{
            border: PIXEL_BORDER,
            imageRendering: "pixelated",
            textShadow: "3px 3px 0px rgba(0,0,0,0.3)",
          }}
        >
          Presave
        </motion.button>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/90 text-sm [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
            Coming in January 2025!
          </p>
        </div>
      </div>
    </motion.div>
  );
}
