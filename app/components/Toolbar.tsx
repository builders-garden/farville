"use client";

import { useGame } from "../context/GameContext";
import { CropType } from "../types/game";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

const CROPS: { type: CropType; icon: string }[] = [
  { type: "wheat", icon: "🌾" },
  { type: "corn", icon: "🌽" },
  { type: "tomato", icon: "🍅" },
  { type: "potato", icon: "🥔" },
];

export default function Toolbar() {
  const { state, selectedCrop, setSelectedCrop, toggleInventory, plantCrop } = useGame();
  const [draggedCrop, setDraggedCrop] = useState<CropType | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const dragIconRef = useRef<HTMLDivElement | null>(null);

  // Add back the total items calculation
  const totalSeeds = Object.values(state.seeds).reduce((a, b) => a + b, 0);
  const totalCrops = Object.values(state.crops).reduce((a, b) => a + b, 0);
  const totalItems = totalSeeds + totalCrops;

  // Create floating drag icon if it doesn't exist
  const createDragIcon = (type: CropType) => {
    if (!dragIconRef.current) {
      const icon = document.createElement('div');
      icon.className = 'fixed pointer-events-none z-50 text-2xl filter drop-shadow scale-150';
      icon.innerHTML = CROPS.find(crop => crop.type === type)?.icon || "🌱";
      document.body.appendChild(icon);
      dragIconRef.current = icon;
    }
  };

  const updateDragIconPosition = (x: number, y: number) => {
    if (dragIconRef.current) {
      dragIconRef.current.style.left = `${x}px`;
      dragIconRef.current.style.top = `${y}px`;
      dragIconRef.current.style.transform = 'translate(-50%, -50%)';
    }
  };

  const removeDragIcon = () => {
    if (dragIconRef.current) {
      document.body.removeChild(dragIconRef.current);
      dragIconRef.current = null;
    }
  };

  const handleDragStart = (type: CropType, e: React.DragEvent) => {
    e.dataTransfer.setData("cropType", type);
    // Set a custom drag image (optional)
    const dragIcon = document.createElement("span");
    dragIcon.innerText = CROPS.find(crop => crop.type === type)?.icon || "🌱";
    dragIcon.className = "text-2xl";
    document.body.appendChild(dragIcon);
    e.dataTransfer.setDragImage(dragIcon, 15, 15);
    setTimeout(() => document.body.removeChild(dragIcon), 0);
  };

  const handleTouchStart = (type: CropType, e: React.TouchEvent) => {
    if (state.seeds[type] === 0) return;
    setTouchStartTime(Date.now());
    const touch = e.touches[0];
    createDragIcon(type);
    updateDragIconPosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragIconRef.current) return;
    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    updateDragIconPosition(touch.clientX, touch.clientY);
    
    // Add visual feedback for valid drop targets
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => cell.classList.remove('dragover'));
    
    const gridCell = element?.closest('.grid-cell');
    if (gridCell && gridCell.getAttribute('data-tilled') === 'true') {
      gridCell.classList.add('dragover');
    }
  };

  const handleTouchEnd = (type: CropType, e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTime;
    
    // Handle quick tap
    if (touchDuration < 200) {
      setSelectedCrop(selectedCrop === type ? null : type);
      removeDragIcon();
      return;
    }

    // Handle drag end
    const touch = e.changedTouches[0];
    const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const gridCell = dropElement?.closest('.grid-cell');
    
    // Remove dragover class from all cells
    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => cell.classList.remove('dragover'));
    
    if (gridCell && gridCell.getAttribute('data-tilled') === 'true') {
      const x = parseInt(gridCell.getAttribute('data-x') || '0');
      const y = parseInt(gridCell.getAttribute('data-y') || '0');
      if (!gridCell.querySelector('.crop-sprite')) { // Only plant if no crop exists
        plantCrop(x, y, type);
      }
    }

    setDraggedCrop(null);
    removeDragIcon();
  };

  return (
    <div className="bg-[var(--wood)] p-2 border-t-2 border-[#6d4c2c]">
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        <div className="flex gap-2">
          {CROPS.map(({ type, icon }) => (
            <button
              key={type}
              draggable={state.seeds[type] > 0}
              onDragStart={(e) => handleDragStart(type, e)}
              onTouchStart={(e) => handleTouchStart(type, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={(e) => handleTouchEnd(type, e)}
              className={`relative p-2 rounded-lg ${
                selectedCrop === type
                  ? "bg-[#6d4c2c] text-white"
                  : "hover:bg-black/10"
              } ${state.seeds[type] > 0 ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed"}`}
              disabled={state.seeds[type] === 0}
            >
              <span className="text-2xl filter drop-shadow">{icon}</span>
              <span className="absolute -top-1 -right-1 bg-black/50 text-white text-xs px-1 rounded">
                {state.seeds[type]}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={toggleInventory}
          className="px-3 py-1.5 bg-[#6d4c2c] text-white/90 rounded-lg hover:bg-[#8B5E3C] transition-colors"
        >
          Inventory ({totalItems}/{state.inventoryCapacity})
        </button>
      </div>
    </div>
  );
}
