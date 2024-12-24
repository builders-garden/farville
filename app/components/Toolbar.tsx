"use client";

import { useGame } from "../context/GameContext";
import { CropType } from "../types/game";

const CROPS: { type: CropType; icon: string }[] = [
  { type: "wheat", icon: "🌾" },
  { type: "corn", icon: "🌽" },
  { type: "tomato", icon: "🍅" },
  { type: "potato", icon: "🥔" },
];

export default function Toolbar() {
  const { state, selectedCrop, setSelectedCrop, toggleInventory } = useGame();

  const totalSeeds = Object.values(state.seeds).reduce((a, b) => a + b, 0);
  const totalCrops = Object.values(state.crops).reduce((a, b) => a + b, 0);
  const totalItems = totalSeeds + totalCrops;

  return (
    <div className="bg-[var(--wood)] p-2 border-t-2 border-[#6d4c2c]">
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        <div className="flex gap-2">
          {CROPS.map(({ type, icon }) => (
            <button
              key={type}
              onClick={() =>
                setSelectedCrop(selectedCrop === type ? null : type)
              }
              className={`relative p-2 rounded-lg ${
                selectedCrop === type
                  ? "bg-[#6d4c2c] text-white"
                  : "hover:bg-black/10"
              }`}
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
