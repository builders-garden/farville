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
  const { tillSoil, plantCrop, harvestCrop, selectedCrop } = useGame();
  const [showFloating, setShowFloating] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
  const [harvestedExp, setHarvestedExp] = useState<number | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
    if (cell.crop?.readyToHarvest) {
      // Store the rewards before harvesting
      const cropType = cell.crop.type;
      const rewards = getRewards(cropType);
      setHarvestedExp(rewards.exp);

      // Get cell position for animation before harvesting
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        setFloatingPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setShowFloating(true);

        // Harvest after setting up the animation
        harvestCrop(cell.x, cell.y);

        // Reset animation after it completes
        setTimeout(() => {
          setShowFloating(false);
          setHarvestedExp(null);
        }, 2000);
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

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element === cellRef.current && cell.tilled && !cell.crop) {
      setIsDragOver(true);
    } else {
      setIsDragOver(false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element === cellRef.current && cell.tilled && !cell.crop) {
      // Find the currently dragged crop type from the toolbar
      const draggedButton = document.querySelector('button[dragging="true"]');
      if (draggedButton) {
        const cropType = draggedButton.getAttribute(
          "data-crop-type"
        ) as CropType;
        if (cropType) {
          plantCrop(cell.x, cell.y, cropType);
        }
      }
    }
  };

  return (
    <motion.div
      ref={cellRef}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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
        ${!cell.crop && cell.tilled ? "drop-target" : ""}
        ${isDragOver ? "dragover" : ""}
        transition-colors duration-200
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
