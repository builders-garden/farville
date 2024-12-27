"use client";

import { motion } from "framer-motion";
import { useAudio } from "../context/AudioContext";
import { useState, useEffect } from "react";
import { GridCell as GridCellType, Crop, CropType } from "../types/game";
import CropSprite from "./CropSprite";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";

const DEMO_SEEDS: { type: CropType; icon: string; name: string }[] = [
  { type: "wheat", icon: "🌾", name: "Wheat" },
  { type: "corn", icon: "🌽", name: "Corn" },
  { type: "tomato", icon: "🍅", name: "Tomato" },
  { type: "potato", icon: "🥔", name: "Potato" },
];

// Demo version of CropSprite that shows seconds instead of minutes/hours
function DemoCropSprite({ crop }: { crop: Crop }) {
  const elapsed = Date.now() - crop.plantedAt;
  const progress = Math.min(elapsed / DEMO_GROWTH_TIME, 1);

  return (
    <>
      <CropSprite crop={crop} />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400"
          style={{
            width: `${progress * 100}%`,
            transition: "width 1s linear",
          }}
        />
      </div>
    </>
  );
}

// At the top of the file, add this interface
interface DemoGridCell extends GridCellType {
  justHarvested?: boolean;
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
    ease: "easeInOut"
  }
};

export default function WelcomeOverlay({
  onStart,
  safeAreaInsets,
}: {
  onStart: () => void;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const { startBackgroundMusic, playSound } = useAudio();
  const [selectedSeed, setSelectedSeed] = useState<CropType | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);

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
        };
      } else if (cell.crop?.readyToHarvest) {
        // Harvest the crop and keep the soil tilled
        playSound("harvest");
        cell.crop = undefined;
        cell.justHarvested = true;

        // Remove the justHarvested flag after a short delay
        setTimeout(() => {
          setDemoCells((prev) => {
            const newCells = [...prev];
            const cell = newCells[index];
            cell.justHarvested = false;
            return newCells;
          });
        }, 500);
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
      className="fixed inset-0 w-full h-full z-[100] bg-[#2d5a27] flex flex-col items-center justify-center gap-2 p-4"
    >
      {/* Updated Image component with responsive sizing */}
      <div className="w-full max-w-[300px] h-auto min-h-0 flex-shrink-0">
        <Image
          src="/images/welcome.png"
          alt="FarVille"
          width={150}
          height={50}
          className="rounded-xl mx-auto"
          priority
          style={{
            objectFit: "contain",
          }}
        />
      </div>

      {/* Seed Selection Toolbar */}
      <div className="flex gap-2 mt-4">
        {DEMO_SEEDS.map(({ type, icon, name }) => (
          <motion.div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, type)}
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
              ${selectedSeed === type ? "border-yellow-400" : "border-[#2d5a27]"}
              hover:border-yellow-400/50 transition-colors
            `}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-[10px] text-white mt-0.5">{name}</span>
            
            {/* Tooltip */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Drag to plant!
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-[#234d1f] rounded-xl">
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
              ${
                cell.tilled
                  ? "bg-[var(--soil)]"
                  : "bg-[var(--grass)] hover:bg-[var(--grass-hover)]"
              }
              transition-colors duration-200
            `}
            style={{
              backgroundImage: cell.tilled ? "var(--soil-pattern)" : "none",
              backgroundSize: "4px 4px",
            }}
          >
            {cell.crop && <DemoCropSprite crop={cell.crop} />}
          </motion.div>
        ))}
      </div>

      {/* Presave Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={async () => {
          startBackgroundMusic();
          await sdk.actions.addFrame();
          onStart();
        }}
        className="mt-8 px-16 py-4 bg-white text-emerald-500 rounded-xl text-2xl font-bold
                 hover:bg-emerald-100 hover:text-emerald-600 transition-colors shadow-lg border-2 border-emerald-600"
      >
        Presave
      </motion.button>
    </motion.div>
  );
}
