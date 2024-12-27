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
  const [harvestedAmount, setHarvestedAmount] = useState<number | null>(null);
  const [harvestedCropType, setHarvestedCropType] = useState<CropType | null>(
    null
  );
  const cellRef = useRef<HTMLDivElement>(null);
  const [isDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isValidFertilizerTarget = cell.crop && !cell.crop.readyToHarvest;

  const getRewards = (type: CropType) => {
    const baseRewards = {
      wheat: { exp: 2, minAmount: 1, maxAmount: 2 },
      corn: { exp: 6, minAmount: 1, maxAmount: 2 },
      tomato: { exp: 12, minAmount: 1, maxAmount: 2 },
      potato: { exp: 25, minAmount: 1, maxAmount: 2 },
    };

    // Get yield multiplier from game state
    const yieldMultiplier = state.perks.active
      .filter(
        (perk) =>
          perk.type === "YIELD_BOOSTER" &&
          (!perk.cropType || perk.cropType === type)
      )
      .reduce((mult, perk) => mult * perk.multiplier, 1);

    const baseAmount = Math.floor(Math.random() * 2) + 1; // Simplified since all ranges are 1-2

    return {
      exp: baseRewards[type].exp,
      amount: Math.floor(baseAmount * yieldMultiplier),
    };
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
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        const cropType = cell.crop.type;
        const rewards = getRewards(cropType);

        setFloatingPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });

        console.log("Setting rewards:", {
          exp: rewards.exp,
          amount: rewards.amount,
          cropType,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          },
        });

        setHarvestedExp(rewards.exp);
        setHarvestedAmount(rewards.amount);
        setHarvestedCropType(cropType);
        setShowFloating(true);

        harvestCrop(cell.x, cell.y);

        setTimeout(() => {
          setShowFloating(false);
          setHarvestedExp(null);
          setHarvestedAmount(null);
          setHarvestedCropType(null);
        }, 1500);
      }
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
            cropType={harvestedCropType || "wheat"}
          />
        </>
      )}
    </motion.div>
  );
}
