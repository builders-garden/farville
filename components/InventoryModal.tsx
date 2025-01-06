"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { useFrameContext } from "../context/FrameContext";
import { UserItem } from "@/hooks/use-user-items";
import { SeedType } from "@/types/game";

export default function InventoryModal({ onClose }: { onClose: () => void }) {
  const { state, setSelectedSeed, setSelectedFertilizer } = useGame();
  const { safeAreaInsets } = useFrameContext();

  const handlePerkClick = (perk: UserItem) => {
    if (perk.item.name === "Fertilizer" && perk.quantity && perk.quantity > 0) {
      setSelectedFertilizer(perk);
      setSelectedSeed(null);
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
                {state.items
                  .filter((item) => item.category === "seed")
                  .map((item) => {
                    const seedQuantity =
                      state.seeds.find((seed) => seed.item.slug === item.slug)
                        ?.quantity || 0;

                    return (
                      <motion.div
                        key={item.id}
                        className="bg-[#6d4c2c] aspect-square rounded-lg relative flex items-center justify-center
                               shadow-lg hover:shadow-xl transition-shadow duration-200
                               border-2 border-[#8B5E3C]"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedSeed(item.slug as SeedType)}
                      >
                        <motion.img
                          src={`/images/${item.icon}`}
                          alt={`${item.name} seed`}
                          className="w-8 h-8 object-contain"
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute -top-2 -right-2 bg-[#FFB938] text-[#7E4E31] text-xs px-2 py-0.5 
                                 rounded-full font-bold shadow-md border border-[#7E4E31]"
                          animate={{
                            scale: seedQuantity ? [1, 1.1, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {seedQuantity}
                        </motion.div>
                      </motion.div>
                    );
                  })}
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
                {state.items
                  .filter((item) => item.category === "crop")
                  .map((item) => {
                    const cropQuantity =
                      state.crops.find((crop) => crop.item.slug === item.slug)
                        ?.quantity || 0;

                    return (
                      <motion.div
                        key={item.id}
                        className="bg-[#6d4c2c] aspect-square rounded-lg relative flex items-center justify-center
                               shadow-lg hover:shadow-xl transition-shadow duration-200
                               border-2 border-[#8B5E3C]"
                      >
                        <motion.img
                          src={`/images/${item.icon}`}
                          alt={`${item.name} crop`}
                          className="w-8 h-8 object-contain"
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute -top-2 -right-2 bg-[#FFB938] text-[#7E4E31] text-xs px-2 py-0.5 
                                 rounded-full font-bold shadow-md border border-[#7E4E31]"
                          animate={{
                            scale: cropQuantity > 0 ? [1, 1.1, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {cropQuantity}
                        </motion.div>
                      </motion.div>
                    );
                  })}
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
                {state.items
                  .filter((item) => item.category === "perk")
                  .map((perk) => {
                    const userPerk = state.perks.find(
                      (p) => p.item.slug === perk.slug
                    );
                    const perkQuantity = userPerk?.quantity || 0;

                    return (
                      <motion.div
                        key={perk.id}
                        className="bg-[#6d4c2c] aspect-square rounded-lg relative flex items-center justify-center
                               shadow-lg hover:shadow-xl transition-shadow duration-200
                               border-2 border-[#8B5E3C]"
                        whileHover={{ scale: 1.05 }}
                        title={perk.description}
                        onClick={() => {
                          if (userPerk) {
                            handlePerkClick(userPerk);
                          }
                        }}
                      >
                        <motion.span
                          className="text-2xl"
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {perk.icon}
                        </motion.span>

                        <motion.div
                          className="absolute -top-2 -right-2 bg-[#FFB938] text-[#7E4E31] text-xs px-2 py-0.5 
                                   rounded-full font-bold shadow-md border border-[#7E4E31]"
                          animate={{
                            scale: perkQuantity > 0 ? [1, 1.1, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {perkQuantity}
                        </motion.div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
