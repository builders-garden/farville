"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { CropType, SeedType } from "../types/game";
import CropSprite from "./CropSprite";
import FloatingNumber from "./animations/FloatingNumber";
import { useState, useRef } from "react";
import { DbGridCell } from "@/supabase/types";
import { CROP_DATA } from "@/lib/game-constants";

interface GridCellProps {
  cell: DbGridCell;
}

export default function GridCell({ cell }: GridCellProps) {
  const {
    plantSeed,
    harvestCrop,
    fertilize,
    selectedSeed,
    selectedFertilizer,
    setSelectedFertilizer,
    isActionInProgress,
  } = useGame();
  const [showFloating, setShowFloating] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
  const [harvestedExp, setHarvestedExp] = useState<number | null>(null);
  const [harvestedAmount, setHarvestedAmount] = useState<number | null>(null);
  const [harvestedCropType, setHarvestedCropType] = useState<CropType | null>(
    null
  );
  const cellRef = useRef<HTMLDivElement>(null);
  const [isDragOver] = useState(false);

  const isReadyToHarvest =
    cell.isReadyToHarvest ||
    (cell.plantedAt &&
      new Date(cell.plantedAt).getTime() +
        CROP_DATA[cell.cropType as CropType].growthTime <
        Date.now());

  const isValidFertilizerTarget = cell.plantedAt && !isReadyToHarvest;

  const { state } = useGame();

  const handleClick = async () => {
    if (isActionInProgress) return;

    if (selectedFertilizer && isValidFertilizerTarget) {
      await fertilize({ x: cell.x, y: cell.y });
      setSelectedFertilizer(null);
      return;
    }

    if (cell.plantedAt && isReadyToHarvest) {
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        const cropType = cell.cropType as CropType;
        const harvestResult = await harvestCrop({
          x: cell.x,
          y: cell.y,
        });

        if (!harvestResult) {
          return;
        }

        setFloatingPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });

        setHarvestedExp(harvestResult.rewards?.xp || 0);
        setHarvestedAmount(harvestResult.rewards?.amount || 0);
        setHarvestedCropType(cropType);
        setShowFloating(true);

        setTimeout(() => {
          setShowFloating(false);
          setHarvestedExp(null);
          setHarvestedAmount(null);
          setHarvestedCropType(null);
        }, 1500);
      }
    } else if (selectedSeed && !cell.plantedAt) {
      await plantSeed({
        x: cell.x,
        y: cell.y,
        seedType: selectedSeed,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!cell.plantedAt) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const seedType = e.dataTransfer.getData("seedType") as SeedType;
    if (!cell.plantedAt) {
      await plantSeed({ x: cell.x, y: cell.y, seedType });
    }
  };

  return (
    <motion.div
      ref={cellRef}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-x={cell.x}
      data-y={cell.y}
      className={`
        grid-cell
        aspect-square rounded-xl relative
        ${
          isActionInProgress
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }
        ${
          selectedFertilizer && isValidFertilizerTarget
            ? "border-4 border-yellow-400 shadow-lg"
            : ""
        }
        ${selectedFertilizer && !isValidFertilizerTarget ? "opacity-50" : ""}
        ${
          selectedSeed && !cell.plantedAt
            ? "border-4 border-green-400 shadow-lg"
            : ""
        }
        ${selectedSeed && cell.plantedAt ? "opacity-50" : ""}
        ${!cell.plantedAt ? "drop-target" : ""}
        ${isDragOver ? "dragover" : ""}
        transition-all duration-200
      `}
      initial={false}
      animate={{
        scale: isReadyToHarvest ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: 1,
        repeat: isReadyToHarvest ? Infinity : 0,
        repeatType: "reverse",
      }}
    >
      <CropSprite
        crop={
          cell.cropType
            ? {
                type: cell.cropType as CropType,
                plantedAt: cell.plantedAt
                  ? new Date(cell.plantedAt).getTime()
                  : 0,
                readyToHarvest: !!isReadyToHarvest,
              }
            : undefined
        }
      />

      {/* Fertilizer Hover Effect */}
      {selectedFertilizer && isValidFertilizerTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-yellow-400/20 rounded-lg flex items-center justify-center"
        >
          <span className="text-2xl">🧪</span>
        </motion.div>
      )}

      {/* Seed Planting Hover Effect */}
      {selectedSeed && !cell.plantedAt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-green-400/20 rounded-lg flex items-center justify-center"
        >
          <motion.img
            src={`/images/${
              state.items.find((item) => item.slug === selectedSeed)?.icon
            }`}
            alt={selectedSeed}
            className="w-8 h-8 object-contain opacity-75"
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Floating Numbers */}
      {showFloating && (
        <>
          <FloatingNumber
            number={harvestedExp || 0}
            x={floatingPosition.x}
            y={floatingPosition.y - 20}
            type="xp"
          />
          <FloatingNumber
            number={harvestedAmount || 0}
            x={floatingPosition.x}
            y={floatingPosition.y + 20}
            type="crop"
            cropType={harvestedCropType!}
          />
        </>
      )}
    </motion.div>
  );
}
