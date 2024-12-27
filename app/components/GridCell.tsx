"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { CropType, GridCell as GridCellType } from "../types/game";
import CropSprite from "./CropSprite";
import FloatingNumber from "./animations/FloatingNumber";
import { useState, useRef } from "react";

interface GridCellProps {
  cell: GridCellType;
}

export default function GridCell({ cell }: GridCellProps) {
  const {
    tillSoil,
    plantCrop,
    harvestCrop,
    selectedCrop,
    selectedFertilizer,
    state,
    dispatch,
    setSelectedFertilizer,
  } = useGame();
  const [showFloating, setShowFloating] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
  const [harvestedExp, setHarvestedExp] = useState<number | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const [isDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isValidFertilizerTarget = cell.crop && !cell.crop.readyToHarvest;

  const getRewards = (type: CropType) => {
    const rewards = {
      wheat: { exp: 5 },
      corn: { exp: 8 },
      tomato: { exp: 10 },
      potato: { exp: 12 },
    };
    return rewards[type];
  };

  const handleClick = () => {
    if (selectedFertilizer && cell.crop && !cell.crop.readyToHarvest) {
      dispatch({
        type: "ACTIVATE_PERK",
        perk: selectedFertilizer,
        x: cell.x,
        y: cell.y,
      });
      setSelectedFertilizer(null);
      return;
    }

    if (cell.crop?.readyToHarvest) {
      harvestCrop(cell.x, cell.y);
    } else if (!cell.tilled) {
      tillSoil(cell.x, cell.y);
    } else if (selectedCrop && !cell.crop) {
      plantCrop(cell.x, cell.y, selectedCrop);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (cell.tilled && !cell.crop) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cropType = e.dataTransfer.getData("cropType") as CropType;
    if (cell.tilled && !cell.crop) {
      plantCrop(cell.x, cell.y, cropType);
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
      data-tilled={cell.tilled}
      data-x={cell.x}
      data-y={cell.y}
      className={`
        grid-cell
        aspect-square rounded-lg relative cursor-pointer
        ${
          cell.tilled
            ? "bg-[var(--soil)]"
            : "bg-[var(--grass)] hover:bg-[var(--grass-hover)]"
        }
        ${
          selectedFertilizer && isValidFertilizerTarget
            ? "border-4 border-yellow-400 shadow-lg"
            : ""
        }
        ${selectedFertilizer && !isValidFertilizerTarget ? "opacity-50" : ""}
        ${!cell.crop && cell.tilled ? "drop-target" : ""}
        ${isDragOver ? "dragover" : ""}
        transition-all duration-200
      `}
      style={{
        backgroundImage: cell.tilled ? "var(--soil-pattern)" : "none",
        backgroundSize: "4px 4px",
      }}
      initial={false}
      animate={{
        scale: cell.crop?.readyToHarvest ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: 1,
        repeat: cell.crop?.readyToHarvest ? Infinity : 0,
        repeatType: "reverse",
      }}
    >
      {cell.crop && <CropSprite crop={cell.crop} />}

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
      {showFloating && harvestedExp && (
        <FloatingNumber
          number={harvestedExp}
          x={floatingPosition.x}
          y={floatingPosition.y}
          type="xp"
        />
      )}
    </motion.div>
  );
}
