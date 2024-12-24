"use client";

import { useState } from "react";
import { useGame } from "../context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { EXPANSION_COSTS } from "../context/GameContext";

interface LandExpansionModalProps {
  onClose: () => void;
}

export function LandExpansionModal({ onClose }: LandExpansionModalProps) {
  const { state, dispatch } = useGame();
  const currentExpansion = EXPANSION_COSTS[state.expansionLevel];

  const handleExpand = () => {
    if (currentExpansion && state.coins >= currentExpansion.coins) {
      dispatch({ type: "EXPAND_LAND" });
      onClose(); // Close modal after successful expansion
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-md mx-auto rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-4 bg-[var(--wood)] text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Expand Your Farm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/20 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-lg">Current Farm Size</p>
            <p className="text-3xl font-bold">
              {state.gridSize.width}x{state.gridSize.height}
            </p>
          </div>

          {currentExpansion ? (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium mb-2">Next Expansion</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold">
                      {currentExpansion.nextSize.width}x
                      {currentExpansion.nextSize.height}
                    </p>
                    <p className="text-sm text-gray-600">
                      +{currentExpansion.nextSize.width - state.gridSize.width}{" "}
                      rows and columns
                    </p>
                  </div>
                  <p className="text-xl font-bold text-yellow-600">
                    {currentExpansion.coins} 🪙
                  </p>
                </div>
              </div>

              <button
                onClick={handleExpand}
                disabled={state.coins < currentExpansion.coins}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium
                  ${
                    state.coins >= currentExpansion.coins
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                {state.coins >= currentExpansion.coins
                  ? "Expand Farm"
                  : `Need ${currentExpansion.coins - state.coins} more coins`}
              </button>
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Maximum farm size reached!
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function LandExpansion() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[var(--wood)]/80 text-white rounded-lg hover:bg-[var(--wood)] transition-colors flex items-center gap-2"
      >
        🌱 Expand Land
      </button>

      <AnimatePresence>
        {isOpen && <LandExpansionModal onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
