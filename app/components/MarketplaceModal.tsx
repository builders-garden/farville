"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useGame } from "../context/GameContext";
import { CropType } from "../types/game";
import { EXPANSION_COSTS } from "../context/GameContext";
import { Perk } from "../types/perks";

const SEEDS: { type: CropType; icon: string; price: number; name: string }[] = [
  { type: "wheat", name: "Wheat", icon: "🌾", price: 5 },
  { type: "corn", name: "Corn", icon: "🌽", price: 8 },
  { type: "tomato", name: "Tomato", icon: "🍅", price: 12 },
  { type: "potato", name: "Potato", icon: "🥔", price: 15 },
];

const PERKS: Perk[] = [
  {
    id: "yield_1",
    name: "Basic Yield Booster",
    description: "Increases crop yield by 50% for 24 hours",
    cost: 500,
    type: "YIELD_BOOSTER",
    multiplier: 1.5,
    icon: "✨",
    duration: 24 * 60 * 60 * 1000,
  },
  {
    id: "yield_2",
    name: "Advanced Yield Booster",
    description: "Doubles crop yield for 24 hours",
    cost: 1000,
    type: "YIELD_BOOSTER",
    multiplier: 2,
    icon: "✨",
    duration: 24 * 60 * 60 * 1000,
  },
  {
    id: "growth_1",
    name: "Basic Fertilizer",
    description: "Crops grow 50% faster for 24 hours",
    cost: 500,
    type: "GROWTH_BOOSTER",
    multiplier: 1.5,
    icon: "🌱",
    duration: 24 * 60 * 60 * 1000,
  },
  {
    id: "growth_2",
    name: "Premium Fertilizer",
    description: "Crops grow twice as fast for 24 hours",
    cost: 1000,
    type: "GROWTH_BOOSTER",
    multiplier: 2,
    icon: "🌱",
    duration: 24 * 60 * 60 * 1000,
  },
];

type Tab = "seeds" | "crops" | "perks" | "expansions";

export default function MarketplaceModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<Tab>("seeds");

  const handleBuySeeds = (cropType: CropType, amount: number) => {
    dispatch({ type: "BUY_SEEDS", cropType, amount });
  };

  const handleSellCrops = (cropType: CropType, amount: number) => {
    dispatch({ type: "SELL_CROPS", cropType, amount });
  };

  const handleExpandLand = () => {
    dispatch({ type: "EXPAND_LAND" });
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "seeds", label: "Seeds", icon: "🌱" },
    { id: "crops", label: "Crops", icon: "🌾" },
    { id: "perks", label: "Perks", icon: "⭐" },
    { id: "expansions", label: "Expand", icon: "🗺️" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
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
                <span className="text-3xl">🏪</span> Market
              </motion.h2>
              <motion.p
                className="text-white/70 text-sm flex items-center gap-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Your coins:{" "}
                <span className="text-[#FFB938] font-bold">
                  🪙 {state.coins}
                </span>
              </motion.p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center hover:rotate-90 transform duration-200"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 w-full
                  ${
                    activeTab === tab.id
                      ? "bg-[#6d4c2c] text-white scale-105 shadow-lg"
                      : "text-white/70 hover:bg-[#6d4c2c]/50"
                  }`}
                whileHover={{ scale: activeTab === tab.id ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  animate={{ rotate: activeTab === tab.id ? [0, -5, 5, 0] : 0 }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  {tab.icon}
                </motion.span>
                <span className="text-sm">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Seeds Tab */}
          {activeTab === "seeds" && (
            <motion.div
              className="grid gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {SEEDS.map(({ type, icon, price, name }, index) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col md:flex-row md:items-center gap-3
                           border border-[#8B5E3C]/50 shadow-md"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <motion.span
                        className="text-2xl"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {icon}
                      </motion.span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 font-medium">{name} Seeds</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">
                          Price:{" "}
                          <span className="text-[#FFB938] font-medium">
                            🪙 {price}
                          </span>
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60">
                          Owned:{" "}
                          <span className="text-white/90 font-medium">
                            {state.seeds[type]}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-13 md:ml-0">
                    {[1, 5, 10].map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleBuySeeds(type, amount)}
                        disabled={state.coins < price * amount}
                        className="min-w-[70px] py-1.5 bg-[#8B5E3C] text-white/90 rounded hover:bg-[#9b6a44] 
                                 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium
                                 border border-white/10"
                      >
                        Buy {amount}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Sell Crops Tab */}
          {activeTab === "crops" && (
            <motion.div
              className="grid gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {SEEDS.map(({ type, icon, name }) => {
                const amount = state.crops[type];
                const sellPrice = {
                  wheat: 10,
                  corn: 15,
                  tomato: 20,
                  potato: 25,
                }[type];

                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col md:flex-row md:items-center gap-3
                             border border-[#8B5E3C]/50 shadow-md"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <motion.span
                          className="text-2xl"
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {icon}
                        </motion.span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/90 font-medium">{name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white/60">
                            Sell:{" "}
                            <span className="text-[#FFB938] font-medium">
                              🪙 {sellPrice}
                            </span>
                          </span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/60">
                            Owned:{" "}
                            <span className="text-white/90 font-medium">
                              {amount}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-13 md:ml-0">
                      {[1, 5, 10].map((sellAmount) => (
                        <motion.button
                          key={sellAmount}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSellCrops(type, sellAmount)}
                          disabled={amount < sellAmount}
                          className="min-w-[70px] py-1.5 bg-[#2B593B] text-white/90 rounded hover:bg-[#346344] 
                                   transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium
                                   border border-white/10"
                        >
                          Sell {sellAmount}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Expansions Tab */}
          {activeTab === "expansions" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {state.expansionLevel < EXPANSION_COSTS.length ? (
                <div className="bg-[#6d4c2c] px-4 py-3 rounded-lg border border-[#8B5E3C]/50 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <motion.span
                        className="text-2xl"
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🌟
                      </motion.span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 font-medium">
                        Next Expansion
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">
                          Size:{" "}
                          <span className="text-white/90 font-medium">
                            {
                              EXPANSION_COSTS[state.expansionLevel].nextSize
                                .width
                            }
                            x
                            {
                              EXPANSION_COSTS[state.expansionLevel].nextSize
                                .height
                            }
                          </span>
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60">
                          Required Level:{" "}
                          <span
                            className={`font-medium ${
                              state.level >=
                              EXPANSION_COSTS[state.expansionLevel].level
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {EXPANSION_COSTS[state.expansionLevel].level}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExpandLand}
                    disabled={
                      state.coins <
                        EXPANSION_COSTS[state.expansionLevel].coins ||
                      state.level < EXPANSION_COSTS[state.expansionLevel].level
                    }
                    className="w-full py-1.5 bg-[#FFB938] text-[#7E4E31] rounded hover:bg-[#ffc65c] 
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium
                             border border-white/10"
                  >
                    {state.level < EXPANSION_COSTS[state.expansionLevel].level
                      ? `Reach Level ${
                          EXPANSION_COSTS[state.expansionLevel].level
                        } to Expand`
                      : `Expand for 🪙 ${
                          EXPANSION_COSTS[state.expansionLevel].coins
                        }`}
                  </motion.button>
                </div>
              ) : (
                <div className="bg-[#6d4c2c] px-4 py-3 rounded-lg border border-[#8B5E3C]/50 shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <p className="text-white/90">
                      Maximum expansion level reached!
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Perks Tab */}
          {activeTab === "perks" && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {/* Active Perks */}
              <div className="bg-[#6d4c2c] px-4 py-3 rounded-lg border border-[#8B5E3C]/50 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⚡</span>
                  <p className="text-white/90 font-medium">Active Perks</p>
                </div>
                <div className="grid gap-2">
                  {state.perks.active.length > 0 ? (
                    state.perks.active.map((perk) => (
                      <div
                        key={perk.id}
                        className="bg-[#5c3d23] px-3 py-2 rounded flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{perk.icon}</span>
                          <div>
                            <p className="text-white/90 text-sm font-medium">
                              {perk.name}
                            </p>
                            <p className="text-white/60 text-xs">
                              {perk.description}
                            </p>
                          </div>
                        </div>
                        {perk.activatedAt && perk.duration && (
                          <div className="text-[#FFB938] text-sm font-medium">
                            {(() => {
                              const remainingMs =
                                perk.duration - (Date.now() - perk.activatedAt);
                              if (remainingMs <= 0) return "Expired";
                              const hours = Math.floor(
                                remainingMs / (60 * 60 * 1000)
                              );
                              const minutes = Math.floor(
                                (remainingMs % (60 * 60 * 1000)) / (60 * 1000)
                              );
                              return `${hours}h ${minutes}m`;
                            })()}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-white/60 text-sm">No active perks</p>
                  )}
                </div>
              </div>

              {/* Available Perks */}
              <div className="grid gap-3">
                {PERKS.map((perk) => {
                  const isOwned = state.perks.owned.some(
                    (p) => p.id === perk.id
                  );
                  const isActive = state.perks.active.some(
                    (p) => p.id === perk.id
                  );

                  return (
                    <motion.div
                      key={perk.id}
                      className="bg-[#6d4c2c] p-4 rounded-lg flex items-center justify-between
                                 border border-[#8B5E3C]/50 shadow-md hover:bg-[#7d583a] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#8B5E3C]/30 rounded-lg flex items-center justify-center">
                          <motion.span
                            className="text-2xl"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            {perk.icon}
                          </motion.span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white/90 font-medium mb-1">
                            {perk.name}
                          </p>
                          <p className="text-white/60 text-sm">
                            {perk.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() =>
                            isOwned
                              ? dispatch({ type: "ACTIVATE_PERK", perk })
                              : dispatch({ type: "PURCHASE_PERK", perk })
                          }
                          disabled={
                            isOwned ? isActive : state.coins < perk.cost
                          }
                          className={`min-w-[100px] py-2 px-4 rounded-lg text-sm font-medium
                                     transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                                     ${
                                       isOwned
                                         ? "bg-[#2B593B] text-white/90 hover:bg-[#346344]"
                                         : "bg-[#8B5E3C] text-white/90 hover:bg-[#9b6a44]"
                                     }
                                     border border-white/10`}
                        >
                          {isOwned
                            ? isActive
                              ? "Active"
                              : "Activate"
                            : `🪙 ${perk.cost}`}
                        </motion.button>
                        {isActive && perk.activatedAt && perk.duration && (
                          <div className="text-[#FFB938] text-sm font-medium">
                            {(() => {
                              const remainingMs =
                                perk.duration - (Date.now() - perk.activatedAt);
                              if (remainingMs <= 0) return "Expired";
                              const hours = Math.floor(
                                remainingMs / (60 * 60 * 1000)
                              );
                              const minutes = Math.floor(
                                (remainingMs % (60 * 60 * 1000)) / (60 * 1000)
                              );
                              return `${hours}h ${minutes}m`;
                            })()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
