"use client";

import { CROPS, useGame } from "../context/GameContext";
import { CropType } from "../types/game";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

// Import the shared colors
const CROP_COLORS: Record<CropType, string> = {
  carrot: "border-orange-400",
  pumpkin: "border-yellow-400",
  tomato: "border-red-400",
  potato: "border-green-400",
};

export default function Toolbar({
  safeAreaInsets,
}: {
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const { state, selectedCrop, setSelectedCrop, toggleInventory } = useGame();
  const [isDragging, setIsDragging] = useState(false);
  const dragIconRef = useRef<HTMLDivElement>(null);
  const touchDragIconRef = useRef<HTMLDivElement>(null);
  const draggedCropRef = useRef<CropType | null>(null);

  // Track touch position
  const updateTouchDragIcon = (x: number, y: number) => {
    if (touchDragIconRef.current) {
      touchDragIconRef.current.style.left = `${x}px`;
      touchDragIconRef.current.style.top = `${y}px`;
      touchDragIconRef.current.style.display = "block";
    }
  };

  // Handle touch start for mobile drag
  const handleTouchStart = (e: React.TouchEvent, type: CropType) => {
    if (state.seeds[type] <= 0) return;

    const touch = e.touches[0];
    draggedCropRef.current = type;
    setIsDragging(true);

    // Initialize drag icon
    if (touchDragIconRef.current) {
      const cropIcon = CROPS.find((crop) => crop.type === type)?.seedIcon;
      if (cropIcon) {
        const img = document.createElement("img");
        img.src = cropIcon;
        img.className = "w-8 h-8";
        touchDragIconRef.current.innerHTML = "";
        touchDragIconRef.current.appendChild(img);
      }
      updateTouchDragIcon(touch.clientX, touch.clientY);
    }

    // Add dragging class to body to prevent scrolling
    document.body.classList.add("dragging");
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    updateTouchDragIcon(touch.clientX, touch.clientY);

    // Find element under touch point
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elemBelow?.closest(".grid-cell");

    // Remove dragover class from all cells
    document.querySelectorAll(".grid-cell").forEach((cell) => {
      cell.classList.remove("dragover");
    });

    // Add dragover class to current cell
    if (dropTarget) {
      dropTarget.classList.add("dragover");
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    const gridCell = dropTarget?.closest(".grid-cell");

    if (gridCell && draggedCropRef.current) {
      // Get cell coordinates from data attributes
      const x = parseInt(gridCell.getAttribute("data-x") || "0");
      const y = parseInt(gridCell.getAttribute("data-y") || "0");

      // Attempt to plant the crop
      if (
        state.grid[y]?.[x] &&
        !state.grid[y][x].crop &&
        state.grid[y][x].tilled
      ) {
        setSelectedCrop(draggedCropRef.current);
        // Small delay to ensure selectedCrop is set before clicking
        setTimeout(() => {
          (gridCell as HTMLElement).click();
        }, 50);
      }
    }

    // Clean up
    if (touchDragIconRef.current) {
      touchDragIconRef.current.style.display = "none";
    }
    document.body.classList.remove("dragging");
    setIsDragging(false);
    draggedCropRef.current = null;

    // Remove dragover class from all cells
    document.querySelectorAll(".grid-cell").forEach((cell) => {
      cell.classList.remove("dragover");
    });
  };

  // Add and remove touch event listeners
  useEffect(() => {
    const handleDocumentTouchMove = (e: TouchEvent) =>
      handleTouchMove(e as unknown as React.TouchEvent);
    const handleDocumentTouchEnd = (e: TouchEvent) =>
      handleTouchEnd(e as unknown as React.TouchEvent);

    document.addEventListener("touchmove", handleDocumentTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleDocumentTouchEnd);

    return () => {
      document.removeEventListener("touchmove", handleDocumentTouchMove);
      document.removeEventListener("touchend", handleDocumentTouchEnd);
    };
  }, [isDragging, state.grid]);

  // Calculate total items
  const totalSeeds = Object.values(state.seeds).reduce((a, b) => a + b, 0);
  const totalCrops = Object.values(state.crops).reduce((a, b) => a + b, 0);
  const totalFertilizers = state.perks.owned
    .filter((perk) => perk.type === "INSTANT_GROWTH")
    .reduce((sum, perk) => sum + (perk.quantity || 0), 0);
  const totalItems = totalSeeds + totalCrops + totalFertilizers;

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, type: CropType) => {
    if (state.seeds[type] <= 0) return;

    e.dataTransfer.setData("cropType", type);
    e.dataTransfer.effectAllowed = "copy";

    // Create a custom drag image
    if (dragIconRef.current) {
      const cropIcon = CROPS.find((crop) => crop.type === type)?.seedIcon;
      if (cropIcon) {
        const img = document.createElement("img");
        img.src = cropIcon;
        img.className = "w-8 h-8";
        dragIconRef.current.innerHTML = "";
        dragIconRef.current.appendChild(img);
      }
      e.dataTransfer.setDragImage(dragIconRef.current, 25, 25);
    }
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 bg-[#7E4E31] p-3 flex justify-between items-center"
      style={{
        marginTop: safeAreaInsets.top,
        marginBottom: safeAreaInsets.bottom,
        marginLeft: safeAreaInsets.left,
        marginRight: safeAreaInsets.right,
      }}
      data-tutorial="toolbar"
    >
      <div className="flex gap-2">
        {CROPS.map(({ type, seedIcon }) => {
          const isAvailable = state.seeds[type] > 0;

          return (
            <motion.button
              key={type}
              onClick={() =>
                isAvailable &&
                setSelectedCrop(selectedCrop === type ? null : type)
              }
              draggable={isAvailable}
              onDragStart={(e) =>
                handleDragStart(e as unknown as React.DragEvent, type)
              }
              onTouchStart={(e) => handleTouchStart(e, type)}
              onTouchEnd={handleTouchEnd}
              whileHover={isAvailable ? { scale: 1.1 } : undefined}
              whileTap={isAvailable ? { scale: 0.95 } : undefined}
              className={`
                relative w-12 h-12 rounded-lg flex items-center justify-center
                ${selectedCrop === type ? "bg-[#6d4c2c]" : "bg-[#8B5E3C]"}
                border-2 ${CROP_COLORS[type]}
                ${
                  isAvailable
                    ? "hover:bg-[#6d4c2c]"
                    : "opacity-50 cursor-not-allowed"
                }
                transition-colors
              `}
            >
              <motion.img
                src={seedIcon}
                alt={`${type} seed`}
                className="w-8 h-8 object-contain"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="absolute -top-2 -right-2 bg-[#6d4c2c] rounded-full w-5 h-5 flex items-center justify-center text-xs text-white/90">
                {state.seeds[type]}
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={toggleInventory}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <span className="text-xl">📦</span>
        <div className="absolute -top-2 -right-2 bg-[#6d4c2c] rounded-full px-1.5 py-0.5 text-xs text-white/90">
          {totalItems}/{state.inventoryCapacity}
        </div>
      </motion.button>
    </div>
  );
}
