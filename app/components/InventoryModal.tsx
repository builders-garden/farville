"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { CropType } from "../types/game";

const ITEMS: { type: CropType; icon: string }[] = [
  { type: "wheat", icon: "🌾" },
  { type: "corn", icon: "🌽" },
  { type: "tomato", icon: "🍅" },
  { type: "potato", icon: "🥔" },
];

export default function InventoryModal({
  onClose,
  safeAreaInsets,
}: {
  onClose: () => void;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const { state, setSelectedCrop, dispatch, setSelectedFertilizer } = useGame();
  const totalSeeds = Object.values(state.seeds).reduce((a, b) => a + b, 0);
  const totalCrops = Object.values(state.crops).reduce((a, b) => a + b, 0);
  const totalFertilizers = state.perks.owned
    .filter((perk) => perk.type === "INSTANT_GROWTH")
    .reduce((sum, perk) => sum + (perk.quantity || 0), 0);
  const totalItems = totalSeeds + totalCrops + totalFertilizers;

  const handlePerkClick = (perk: Perk) => {
    if (perk.type === "INSTANT_GROWTH" && perk.quantity && perk.quantity > 0) {
      setSelectedFertilizer(perk);
      setSelectedCrop(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={{
          marginTop: safeAreaInsets.top,
          marginBottom: safeAreaInsets.bottom,
          marginLeft: safeAreaInsets.left,
          marginRight: safeAreaInsets.right,
        }}
        className="bg-[#7E4E31] w-full min-h-screen"
      >
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <motion.h2
                className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <span className="text-3xl">📦</span> Inventory
              </motion.h2>
              <p className="text-white/70 text-sm flex items-center gap-1">
                <span>Storage:</span>
                <motion.span
                  className={`font-bold ${
                    totalItems >= state.inventoryCapacity
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {totalItems}
                </motion.span>
                <span>/</span>
                <span>{state.inventoryCapacity}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center hover:rotate-90 transform duration-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <motion.h3
                className="text-white/90 font-bold text-lg mb-4 flex items-center gap-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <span className="text-2xl">🌱</span> Seeds
              </motion.h3>
              <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
                {ITEMS.map(({ type, icon }) => (
                  <motion.div
                    key={type}
                    className="bg-[#6d4c2c] aspect-square rounded-lg relative flex items-center justify-center
                             shadow-lg hover:shadow-xl transition-shadow duration-200
                             border-2 border-[#8B5E3C]"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedCrop(type)}
                  >
                    <motion.span
                      className="text-2xl"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {icon}
                    </motion.span>
                    <motion.div
                      className="absolute -top-2 -right-2 bg-[#FFB938] text-[#7E4E31] text-xs px-2 py-0.5 
                               rounded-full font-bold shadow-md border border-[#7E4E31]"
                      animate={{
                        scale: state.seeds[type] > 0 ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {state.seeds[type]}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <motion.h3
                className="text-white/90 font-bold text-lg mb-4 flex items-center gap-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <span className="text-2xl">🌾</span> Harvested Crops
              </motion.h3>
              <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
                {ITEMS.map(({ type, icon }) => (
                  <motion.div
                    key={type}
                    className="bg-[#6d4c2c] aspect-square rounded-lg relative flex items-center justify-center
                             shadow-lg hover:shadow-xl transition-shadow duration-200
                             border-2 border-[#8B5E3C]"
                  >
                    <motion.span
                      className="text-2xl"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {icon}
                    </motion.span>
                    <motion.div
                      className="absolute -top-2 -right-2 bg-[#FFB938] text-[#7E4E31] text-xs px-2 py-0.5 
                               rounded-full font-bold shadow-md border border-[#7E4E31]"
                      animate={{
                        scale: state.crops[type] > 0 ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {state.crops[type]}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <motion.h3
                className="text-white/90 font-bold text-lg mb-4 flex items-center gap-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <span className="text-2xl">⭐</span> Perks
              </motion.h3>
              <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
                {state.perks.owned.map((perk) => (
                  <motion.div
                    key={perk.id}
                    className="bg-[#6d4c2c] aspect-square rounded-lg relative flex items-center justify-center
                             shadow-lg hover:shadow-xl transition-shadow duration-200
                             border-2 border-[#8B5E3C]"
                    whileHover={{ scale: 1.05 }}
                    title={perk.description}
                    onClick={() => handlePerkClick(perk)}
                    style={{
                      cursor:
                        perk.type === "INSTANT_GROWTH" && perk.quantity
                          ? "pointer"
                          : "default",
                    }}
                  >
                    <motion.span
                      className="text-2xl"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {perk.icon}
                    </motion.span>
                    {perk.quantity && (
                      <motion.div
                        className="absolute -top-2 -right-2 bg-[#FFB938] text-[#7E4E31] text-xs px-2 py-0.5 
                                 rounded-full font-bold shadow-md border border-[#7E4E31]"
                        animate={{ scale: perk.quantity > 0 ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {perk.quantity}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
