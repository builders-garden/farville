"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { SeedType } from "../types/game";
import { useState, useRef, useEffect } from "react";

const CROP_COLORS: Record<SeedType, string> = {
  "carrot-seeds": "border-orange-400",
  "pumpkin-seeds": "border-yellow-400",
  "tomato-seeds": "border-red-400",
  "potato-seeds": "border-yellow-400",
};

export default function SeedMenu() {
  const { selectedSeed, setSelectedSeed, state, setShowSeedsMenu } = useGame();

  const [isDragging, setIsDragging] = useState(false);
  const dragIconRef = useRef<HTMLDivElement>(null);
  const touchDragIconRef = useRef<HTMLDivElement>(null);
  const draggedCropRef = useRef<SeedType | null>(null);

  // Track touch position
  const updateTouchDragIcon = (x: number, y: number) => {
    if (touchDragIconRef.current) {
      touchDragIconRef.current.style.left = `${x}px`;
      touchDragIconRef.current.style.top = `${y}px`;
      touchDragIconRef.current.style.display = "block";
    }
  };

  // Handle touch start for mobile drag
  const handleTouchStart = (e: React.TouchEvent, type: SeedType) => {
    const seed = state.seeds.find((seed) => seed.item.slug === type);
    if (!seed || seed.quantity <= 0) return;

    const touch = e.touches[0];
    draggedCropRef.current = type as SeedType;
    setIsDragging(true);

    // Initialize drag icon
    if (touchDragIconRef.current) {
      const seedIcon = seed.item.icon;
      if (seedIcon) {
        const img = document.createElement("img");
        img.src = `/images/seed/${seedIcon}`;
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
      const cell = state.grid.find((cell) => cell.x === x && cell.y === y);

      if (cell && !cell.plantedAt) {
        setSelectedSeed(draggedCropRef.current as SeedType);
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

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, type: SeedType) => {
    const seed = state.seeds.find((seed) => seed.item.slug === type);
    if (!seed || seed.quantity <= 0) return;

    e.dataTransfer.setData("seedType", type);
    e.dataTransfer.effectAllowed = "copy";

    // Create a custom drag image
    if (dragIconRef.current) {
      const seedIcon = seed.item.icon;
      if (seedIcon) {
        const img = document.createElement("img");
        img.src = seedIcon;
        img.className = "w-8 h-8";
        dragIconRef.current.innerHTML = "";
        dragIconRef.current.appendChild(img);
      }
      e.dataTransfer.setDragImage(dragIconRef.current, 25, 25);
    }
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
  }, [handleTouchEnd, handleTouchMove, isDragging, state.grid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 right-4 flex items-center gap-2 mx-2 z-50"
    >
      <div
        ref={dragIconRef}
        className="fixed top-0 left-0 pointer-events-none w-12 h-12 -translate-x-1/2 -translate-y-1/2 z-50"
        style={{ display: "none" }}
      />
      <div
        ref={touchDragIconRef}
        className="fixed top-0 left-0 pointer-events-none w-12 h-12 -translate-x-1/2 -translate-y-1/2 z-50"
        style={{ display: "none" }}
      />

      <motion.div
        className="bg-[#7E4E31] p-3 rounded-lg shadow-lg border-2 border-[#8B5E3C]"
        whileHover={{ scale: 1.05 }}
      >
        <div className="grid grid-cols-6 gap-2 mb-2">
          {state.items
            .filter((item) => item.category === "seed")
            .map((item) => {
              const seed = state.seeds.find((seed) => seed.item.id === item.id);
              const isAvailable = !!seed;
              const quantity = seed?.quantity || 0;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedSeed(
                        selectedSeed === item.slug
                          ? null
                          : (item.slug as SeedType)
                      );
                      // Hide menu when selecting a seed
                      setShowSeedsMenu(false);
                    }
                  }}
                  draggable={isAvailable}
                  onDragStart={(e) =>
                    handleDragStart(
                      e as unknown as React.DragEvent,
                      item.slug as SeedType
                    )
                  }
                  onTouchStart={(e) =>
                    handleTouchStart(e, item.slug as SeedType)
                  }
                  onTouchEnd={handleTouchEnd}
                  className={`
                    relative w-10 h-10 rounded-lg flex items-center justify-center
                    ${
                      selectedSeed === item.slug
                        ? "bg-[#6d4c2c]"
                        : "bg-[#8B5E3C]"
                    }
                    border-2 ${CROP_COLORS[item.slug as SeedType]}
                    ${
                      isAvailable
                        ? "hover:bg-[#6d4c2c]"
                        : "opacity-50 cursor-not-allowed"
                    }
                    transition-colors
                  `}
                  whileHover={isAvailable ? { scale: 1.05 } : undefined}
                  whileTap={isAvailable ? { scale: 0.95 } : undefined}
                >
                  <motion.img
                    src={`/images${item.icon}`}
                    alt={`${item.slug} seed`}
                    className="w-8 h-8 object-contain"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div className="absolute -top-2 -right-2 bg-[#6d4c2c] rounded-full w-5 h-5 flex items-center justify-center text-xs text-white/90">
                    {quantity}
                  </div>
                </motion.button>
              );
            })}
        </div>
        <div className="text-white/90 text-[8px] text-center">
          Select a seed to plant
        </div>
      </motion.div>
      <motion.button
        onClick={() => setShowSeedsMenu(false)}
        className="py-2 px-4 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-red-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
