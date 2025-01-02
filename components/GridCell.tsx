"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { CropType } from "../types/game";
import CropSprite from "./CropSprite";
import FloatingNumber from "./animations/FloatingNumber";
import { useState, useRef } from "react";
import { DbGridCell } from "@/supabase/types";

interface GridCellProps {
  cell: DbGridCell;
}

export default function GridCell({ cell }: GridCellProps) {
  const {
    plantSeed,
    harvestCrop,
    fertilize,
    selectedCrop,
    selectedFertilizer,
    setSelectedFertilizer,
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
  const [isHovered, setIsHovered] = useState(false);

  const isValidFertilizerTarget = cell.plantedAt && !cell.isReadyToHarvest;

  const handleClick = async () => {
    if (selectedFertilizer && isValidFertilizerTarget) {
      await fertilize({ x: cell.x, y: cell.y });
      setSelectedFertilizer(null);
      return;
    }

    if (cell.plantedAt && cell.isReadyToHarvest) {
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        const cropType = cell.cropType as CropType;

        const harvestResult = await harvestCrop({ x: cell.x, y: cell.y });

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
    } else if (selectedCrop && !cell.plantedAt) {
      const updatedCell = await plantSeed({ x: cell.x, y: cell.y, cropType: selectedCrop });
      console.log(updatedCell);
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
    const cropType = e.dataTransfer.getData("cropType") as CropType;
    if (!cell.plantedAt) {
      const updatedCell = await plantSeed({ x: cell.x, y: cell.y, cropType });
      console.log(updatedCell);
    }
  };

  return (
    <motion.div
      ref={cellRef}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-x={cell.x}
      data-y={cell.y}
      className={`
        grid-cell
        aspect-square rounded-xl relative cursor-pointer
        ${
          selectedFertilizer && isValidFertilizerTarget
            ? "border-4 border-yellow-400 shadow-lg"
            : ""
        }
        ${selectedFertilizer && !isValidFertilizerTarget ? "opacity-50" : ""}
        ${!cell.plantedAt ? "drop-target" : ""}
        ${isDragOver ? "dragover" : ""}
        transition-all duration-200
      `}
      initial={false}
      animate={{
        scale: cell.isReadyToHarvest ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: 1,
        repeat: cell.isReadyToHarvest ? Infinity : 0,
        repeatType: "reverse",
      }}
    >
      <CropSprite crop={cell.cropType as CropType} />

      {/* Fertilizer Hover Effect */}
      {selectedFertilizer && isHovered && isValidFertilizerTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-yellow-400/20 rounded-lg flex items-center justify-center"
        >
          <span className="text-2xl">🧪</span>
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
            cropType={harvestedCropType || "carrot"}
          />
        </>
      )}
    </motion.div>
  );
}
