"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CROPS, useGame } from "../context/GameContext";
import { CropType } from "../types/game";
import { EXPANSION_COSTS } from "../context/GameContext";
import { Perk } from "../types/perks";

const PERKS: Perk[] = [
  // {
  //   id: "yield_1",
  //   name: "Basic Yield Booster",
  //   description: "Increases crop yield by 50% for 24 hours",
  //   cost: 500,
  //   type: "YIELD_BOOSTER",
  //   multiplier: 1.5,
  //   icon: "✨",
  //   duration: 24 * 60 * 60 * 1000,
  // },
  // {
  //   id: "yield_2",
  //   name: "Advanced Yield Booster",
  //   description: "Doubles crop yield for 24 hours",
  //   cost: 1000,
  //   type: "YIELD_BOOSTER",
  //   multiplier: 2,
  //   icon: "✨",
  //   duration: 24 * 60 * 60 * 1000,
  // },
  // {
  //   id: "growth_1",
  //   name: "Basic Fertilizer",
  //   description: "Crops grow 50% faster for 24 hours",
  //   cost: 500,
  //   type: "GROWTH_BOOSTER",
  //   multiplier: 1.5,
  //   icon: "🌱",
  //   duration: 24 * 60 * 60 * 1000,
  // },
  // {
  //   id: "growth_2",
  //   name: "Premium Fertilizer",
  //   description: "Crops grow twice as fast for 24 hours",
  //   cost: 1000,
  //   type: "GROWTH_BOOSTER",
  //   multiplier: 2,
  //   icon: "🌱",
  //   duration: 24 * 60 * 60 * 1000,
  // },
  {
    id: "instant_growth_1",
    name: "Fertilizer",
    description: "Instantly grows one crop to full maturity",
    cost: 100,
    type: "INSTANT_GROWTH",
    multiplier: 1,
    icon: "🧪",
    quantity: 1,
  },
  {
    id: "instant_growth_5",
    name: "Fertilizer Pack",
    description: "5 fertilizers to instantly grow crops",
    cost: 450,
    type: "INSTANT_GROWTH",
    multiplier: 1,
    icon: "🧪",
    quantity: 5,
  },
];

type Tab = "seeds" | "crops" | "perks" | "expansions";

export default function MarketplaceModal({
  onClose,
  safeAreaInsets,
}: {
  onClose: () => void;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
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
        style={{
          marginTop: safeAreaInsets.top,
          marginBottom: safeAreaInsets.bottom,
          marginLeft: safeAreaInsets.left,
          marginRight: safeAreaInsets.right,
        }}
        className="bg-[#7E4E31] w-full h-screen flex flex-col"
      >
        <div className="max-w-4xl mx-auto w-full p-6 flex flex-col h-full">
          <div className="flex justify-between mb-6 flex-shrink-0">
            <div className="flex flex-col gap-1">
              <motion.h2
                className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <span className="text-3xl mb-2">🏪</span> Market
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

          <div className="grid grid-cols-4 gap-3 mb-6 flex-shrink-0">
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
                      ? " text-yellow-400 scale-105"
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
                  className="mb-1"
                >
                  {tab.icon}
                </motion.span>
                <span className="text-[10px]">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1 -mr-2 pr-2">
            {activeTab === "seeds" && (
              <motion.div
                className="grid gap-3 pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {CROPS.map(
                  (
                    { name, type, seedIcon, buyPrice, levelRequirement, xp },
                    index
                  ) => (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col md:flex-row md:items-center gap-3
                               border border-[#8B5E3C]/50 shadow-md relative ${
                                 state.level < levelRequirement
                                   ? "opacity-75"
                                   : ""
                               }`}
                    >
                      {state.level < levelRequirement && (
                        <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                          <span className="text-white/90 font-medium bg-red-900/90 px-3 py-1 rounded-lg text-sm">
                            Level {levelRequirement} Required
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <motion.img
                            src={seedIcon}
                            alt={`${name} seed`}
                            className="w-8 h-8 object-contain"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex flex-row gap-1 justify-between">
                            <p className="text-white/90 font-medium">
                              {name} Seeds
                            </p>
                            <p className="text-white/90">
                              <span className="mr-1">🪙</span>
                              {buyPrice}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-white/60 flex items-center">
                              XP:{" "}
                              <span className="text-yellow-400 font-medium flex items-center">
                                <span className="text-sm mb-1 ml-1 mr-0.5">
                                  ⭐
                                </span>
                                {xp}
                              </span>
                            </span>
                            <span className="text-white/40">•</span>
                            <span className="text-white/60">
                              Owned:
                              <span className="text-white/90 font-medium">
                                {state.seeds[type]}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-13 md:ml-0">
                        {state.level >= levelRequirement &&
                          [1, 5, 10].map((amount) => (
                            <motion.button
                              key={amount}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleBuySeeds(type, amount)}
                              disabled={state.coins < buyPrice * amount}
                              className="min-w-[70px] px-2 py-1.5 bg-[#2B593B] text-white/90 rounded hover:bg-[#346344] 
                                    transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium
                                    border border-white/10"
                            >
                              Buy {amount}
                            </motion.button>
                          ))}
                      </div>
                    </motion.div>
                  )
                )}
              </motion.div>
            )}

            {activeTab === "crops" && (
              <motion.div
                className="grid gap-3 pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {CROPS.map(({ type, icon, name, sellPrice }) => {
                  const amount = state.crops[type];

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
                          <motion.img
                            src={icon}
                            alt={name}
                            className="w-8 h-8 object-contain"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex flex-row gap-1 justify-between">
                            <p className="text-white/90 font-medium">{name}</p>
                            <p className="text-white/90">
                              <span className="mr-1">🪙</span>
                              {sellPrice}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-white/60">
                              Owned:
                              <span className="text-white/90 font-medium ml-1">
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
                            className="min-w-[70px] px-2 py-1.5 bg-[#2B593B] text-white/90 rounded hover:bg-[#346344] 
                                     transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium
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

            {activeTab === "expansions" && (
              <motion.div
                className="pb-6"
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
                      <div className="flex-1 flex flex-col gap-2">
                        <p className="text-white/90 font-medium">
                          Next Expansion
                        </p>
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="text-white/60">
                            Size:
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
                          <span className="text-white/60">
                            Required Level:
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
                        state.level <
                          EXPANSION_COSTS[state.expansionLevel].level
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

            {activeTab === "perks" && (
              <motion.div
                className="space-y-3 pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="grid gap-3">
                  {PERKS.map((perk) => {
                    const isOwned = state.perks.owned.some(
                      (p) => p.id === perk.id
                    );

                    return (
                      <motion.div
                        key={perk.id}
                        className="bg-[#6d4c2c] p-4 rounded-lg flex flex-col sm:flex-row sm:items-start gap-4
                                 border border-[#8B5E3C]/50 shadow-md hover:bg-[#7d583a] transition-colors"
                      >
                        <div className="flex sm:flex-1 items-start gap-4 min-w-0">
                          <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <div className="w-12 h-12 bg-[#8B5E3C]/30 rounded-lg flex items-center justify-center">
                              <motion.span
                                className="text-2xl"
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                {perk.icon}
                              </motion.span>
                            </div>
                            
                          </div>
                          <div className="flex flex-col min-w-0 gap-2">
                            <div className="flex flex-row justify-between">
                              <h3 className="text-sm text-white/90 font-medium mb-1">{perk.name}</h3>
                              <div className="h-fit px-2 py-0.5 bg-[#8B5E3C]/50 rounded text-xs text-white/80 font-medium text-center min-w-[24px]">
                              {perk.quantity}x
                              </div>
                            </div>
                            <p className="text-white/60 text-[10px]">
                              {perk.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-stretch sm:items-end gap-2 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() =>
                              dispatch({ type: "PURCHASE_PERK", perk })
                            }
                            disabled={state.coins < perk.cost}
                            className="min-w-[100px] py-2 px-4 rounded text-sm font-medium
                                      bg-[#FFB938] text-[#7E4E31] hover:bg-[#ffc65c]
                                      transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                                      border border-white/10"
                          >
                            🪙 {perk.cost}
                          </motion.button>
                          {isOwned && (
                            <div className="text-green-400 text-xs font-medium text-center sm:text-right">
                              In inventory
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
        </div>
      </motion.div>
    </div>
  );
}
