"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useGame } from "../context/GameContext";
import { CROP_DATA, EXPANSION_COSTS } from "../lib/game-constants";
import Image from "next/image";
import ConfirmationModal from "./ConfirmationModal";
import { DbItem } from "@/supabase/types";

type Tab = "seeds" | "crops" | "perks" | "expansions";

// Add new type for selected item details
type SelectedItemDetails = {
  id: number;
  name: string;
  icon: string;
  buyPrice?: number;
  harvestXp?: number;
  description?: string;
  growthTime?: number;
  cropData: DbItem;
} | null;

export default function MarketplaceModal({
  onClose,
  safeAreaInsets,
}: {
  onClose: () => void;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const { state, buyItem, sellItem, expandGrid, isActionInProgress } =
    useGame();
  const [activeTab, setActiveTab] = useState<Tab>("seeds");
  const [confirmAction, setConfirmAction] = useState<{
    type: "buy" | "sell";
    itemId: number;
    quantity: number;
    itemName: string;
    price: number;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItemDetails>(null);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "seeds", label: "Seeds", icon: "🌱" },
    { id: "crops", label: "Crops", icon: "🌾" },
    { id: "perks", label: "Perks", icon: "✨" },
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
                <Image
                  src="/images/icons/market.png"
                  alt="Market"
                  width={24}
                  height={24}
                />
                Market
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
                {state.items
                  .filter((item) => item.category === "seed")
                  .map((item, index) => (
                    <motion.div
                      key={item.slug}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        const crop = state.items.find(
                          (i) => i.slug === item.slug.replace("-seeds", "")
                        )!;
                        setSelectedItem({
                          id: item.id,
                          name: item.name,
                          icon: item.icon,
                          buyPrice: item.buyPrice,
                          cropData: crop,
                          harvestXp:
                            CROP_DATA[item.slug.replace("-seeds", "")].rewardXP,
                          description: item.description,
                          growthTime:
                            CROP_DATA[item.slug.replace("-seeds", "")]
                              .growthTime /
                            (60000 * 60),
                        });
                      }}
                      className={`bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col md:flex-row md:items-center gap-3
                               border border-[#8B5E3C]/50 shadow-md relative cursor-pointer
                               hover:bg-[#7d583a] transition-colors ${
                                 state.level < item.requiredLevel
                                   ? "opacity-75"
                                   : ""
                               }`}
                    >
                      {state.level < item.requiredLevel && (
                        <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                          <span className="text-white/90 font-medium bg-red-900/90 px-3 py-1 rounded-lg text-sm">
                            Level {item.requiredLevel} Required
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <motion.img
                            src={`/images${item.icon}`}
                            alt={`${item.name} seed`}
                            className="w-8 h-8 object-contain"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex flex-row gap-1 justify-between">
                            <p className="text-white/90 font-medium">
                              {item.name}
                            </p>
                            <p className="text-white/90">
                              <span className="mr-1">🪙</span>
                              {item.buyPrice}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-white/60">
                              Owned:
                              <span className="text-white/90 font-medium">
                                {state.seeds.find(
                                  (seed) => seed.item.id === item.id
                                )?.quantity || 0}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-13 md:ml-0">
                        {state.level >= item.requiredLevel &&
                          [1, 5, 10].map((amount) => (
                            <motion.button
                              key={amount}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() =>
                                setConfirmAction({
                                  type: "buy",
                                  itemId: item.id,
                                  quantity: amount,
                                  itemName: item.name,
                                  price: item.buyPrice * amount,
                                })
                              }
                              disabled={state.coins < item.buyPrice * amount}
                              className="min-w-[70px] px-2 py-1.5 bg-[#2B593B] text-white/90 rounded hover:bg-[#346344] 
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

            {activeTab === "crops" && (
              <motion.div
                className="grid gap-3 pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {state.items
                  .filter((item) => item.category === "crop")
                  .map((item) => {
                    const amount =
                      state.crops.find((crop) => crop.itemId === item.id)
                        ?.quantity || 0;

                    return (
                      <motion.div
                        key={item.slug}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col md:flex-row md:items-center gap-3
                               border border-[#8B5E3C]/50 shadow-md"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <motion.img
                              src={`/images${item.icon}`}
                              alt={item.name}
                              className="w-8 h-8 object-contain"
                              animate={{ y: [0, -2, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          </div>
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="flex flex-row gap-1 justify-between">
                              <p className="text-white/90 font-medium">
                                {item.name}
                              </p>
                              <p className="text-white/90">
                                <span className="mr-1">🪙</span>
                                {item.sellPrice}
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
                              onClick={() =>
                                setConfirmAction({
                                  type: "sell",
                                  itemId: item.id,
                                  quantity: sellAmount,
                                  itemName: item.name,
                                  price: item.sellPrice * sellAmount,
                                })
                              }
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
                      onClick={expandGrid}
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
                  {state.items
                    .filter((item) => item.category === "perk")
                    .map((perk) => {
                      const isOwned = state.perks.some((p) => p.id === perk.id);
                      // const amount =
                      //   state.perks.find((p) => p.id === perk.id)?.quantity ||
                      //   0;

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
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                >
                                  {perk.icon}
                                </motion.span>
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0 gap-2">
                              <div className="flex flex-row justify-between">
                                <h3 className="text-sm text-white/90 font-medium mb-1">
                                  {perk.name}
                                </h3>
                                <div className="h-fit px-2 py-0.5 bg-[#8B5E3C]/50 rounded text-xs text-white/80 font-medium text-center min-w-[24px]">
                                  1x
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
                                setConfirmAction({
                                  type: "buy",
                                  itemId: perk.id,
                                  quantity: 1,
                                  itemName: perk.name,
                                  price: perk.buyPrice,
                                })
                              }
                              disabled={state.coins < perk.buyPrice}
                              className="min-w-[100px] py-2 px-4 rounded text-sm font-medium
                                      bg-[#FFB938] text-[#7E4E31] hover:bg-[#ffc65c]
                                      transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                                      border border-white/10"
                            >
                              🪙 {perk.buyPrice}
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
      {confirmAction && (
        <ConfirmationModal
          title={`${confirmAction.type === "buy" ? "Buy" : "Sell"} ${
            confirmAction.itemName
          }`}
          message={`Are you sure you want to ${
            confirmAction.type === "buy" ? "buy" : "sell"
          } ${confirmAction.quantity}x ${confirmAction.itemName} for 🪙 ${
            confirmAction.price
          }?`}
          onConfirm={() => {
            if (confirmAction.type === "buy") {
              buyItem({
                itemId: confirmAction.itemId,
                quantity: confirmAction.quantity,
              });
            } else {
              sellItem({
                itemId: confirmAction.itemId,
                quantity: confirmAction.quantity,
              });
            }
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {isActionInProgress && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 rounded-lg">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-white/90 rounded-full"
          />
        </div>
      )}
      {/* Add Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#6d4c2c] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <motion.img
                  src={`/images${selectedItem.icon}`}
                  alt={selectedItem.name}
                  className="w-12 h-12 object-contain"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <h3 className="text-white/90 font-bold text-lg">
                  {selectedItem.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-white/70 hover:text-white/90"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-amber-500/90 text-[10px] text-center">
                Each {selectedItem.cropData.name.slice(0, -1)} sells for{" "}
                {selectedItem.cropData.sellPrice}
                <span className="text-sm mb-1">🪙</span>
              </p>

              <div className="grid grid-cols-2 gap-3">
                {selectedItem.buyPrice && (
                  <div className="flex flex-col bg-[#8B5E3C]/30 p-3 rounded gap-2 items-center">
                    <p className="text-white/60">Buy Price</p>
                    <p className="flex items-center gap-1 text-white/90 font-medium">
                      <span className="text-sm mb-1">🪙</span>
                      {selectedItem.buyPrice}
                    </p>
                  </div>
                )}
                {selectedItem.cropData.icon && (
                  <div className="flex flex-col bg-[#8B5E3C]/30 p-3 rounded gap-2 items-center">
                    <p className="text-white/60">Yield</p>
                    <div className="flex flex-row items-center gap-1 text-white/90 font-medium">
                      1-3{" "}
                      <Image
                        width={16}
                        height={16}
                        src={`/images${selectedItem.cropData.icon}`}
                        alt={selectedItem.name}
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                  </div>
                )}
                {selectedItem.harvestXp && (
                  <div className="flex flex-col bg-[#8B5E3C]/30 p-3 rounded gap-2 items-center">
                    <p className="text-white/60">Harvest XP</p>
                    <p className="flex items-center gap-1 text-white/90 font-medium">
                      <span className="text-sm mb-1">⭐</span>
                      {selectedItem.harvestXp}
                    </p>
                  </div>
                )}
                {selectedItem.growthTime && (
                  <div className="flex flex-col bg-[#8B5E3C]/30 p-3 rounded gap-2 items-center">
                    <p className="text-white/60">Growth Time</p>
                    <p className="flex items-center gap-1 text-white/90 font-medium">
                      <span className="text-sm mb-1">⏳</span>
                      {selectedItem.growthTime}hr
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
