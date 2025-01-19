"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { useFrameContext } from "../context/FrameContext";
import { UserItem } from "@/hooks/use-user-items";
import Image from "next/image";
import ItemDetailsPopup from "./ItemDetailsPopup";
import { useState } from "react";
import { DbItem } from "@/supabase/types";
import { requestItemComposeCastUrl } from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import { useCreateRequest } from "@/hooks/game-actions/use-create-request";

export default function InventoryModal({ onClose }: { onClose: () => void }) {
  const { state, setSelectedSeed, setSelectedPerk } = useGame();
  const { safeAreaInsets, context } = useFrameContext();
  const [selectedItem, setSelectedItem] = useState<DbItem | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const {
    mutate: createRequest,
  } = useCreateRequest();

  const handlePerkClick = (perk: UserItem) => {
    if (perk.item.name === "Fertilizer" && perk.quantity && perk.quantity > 0) {
      setSelectedPerk(perk);
      setSelectedSeed(null);
      onClose();
    }
  };

  const handleItemClick = (item: DbItem) => {
    setSelectedItem(item);
  };

  const handleUseItem = (item: DbItem) => {
    if (item.category === "perk") {
      const userPerk = state.perks.find((p) => p.item.slug === item.slug);
      if (userPerk) {
        handlePerkClick(userPerk);
      }
    }
    setSelectedItem(null);
  };

  const handleRequestItem = async (item: DbItem) => {
    if (!context?.user.fid) return;

    try {
      await createRequest(
        {
          itemId: item.id,
          quantity: requestQuantity,
        },
        {
          onSuccess: async (data) => {
            const url = requestItemComposeCastUrl(
              data.id,
              item,
              requestQuantity
            );
            await sdk.actions.openUrl(url);
            setSelectedItem(null);
            setRequestQuantity(1); // Reset quantity after request
          },
          onError: (error) => {
            console.error("Error creating requestssssss", error);
          },
        }
      );
    } catch (error) {
      console.error("Error handling request:", error);
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
        className="bg-[#7E4E31] w-full h-full flex flex-col"
      >
        <div className="p-6 border-b border-[#8B5E3C]">
          <div className="flex justify-between max-w-4xl mx-auto w-full">
            <div className="flex flex-col gap-1">
              <motion.h2
                className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <Image
                  src="/images/icons/inventory.png"
                  alt="Inventory"
                  width={24}
                  height={24}
                />
                Inventory
              </motion.h2>
              <p className="text-white/60 text-[10px]">
                Click an item to see details
              </p>
              <motion.p 
                className="text-amber-500/90 text-[8px] drop-shadow-[0_0_3px_rgba(251,191,36,0.7)]"
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                or to request them from other users!
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
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="space-y-8">
              <div>
                <motion.h3
                  className="text-white/90 font-bold text-lg mb-4 flex items-center gap-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <span className="text-2xl">🌱</span> Seeds
                </motion.h3>
                <div className="grid grid-cols-6 gap-4 md:grid-cols-8">
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
                          onClick={() => handleItemClick(item)}
                        >
                          <motion.img
                            src={`/images${item.icon}`}
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
                <div className="grid grid-cols-6 gap-4 md:grid-cols-8">
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
                          onClick={() => handleItemClick(item)}
                        >
                          <motion.img
                            src={`/images${item.icon}`}
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
                  <span className="text-2xl">✨</span> Perks
                </motion.h3>
                <div className="grid grid-cols-6 gap-4 md:grid-cols-8">
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
                          onClick={() => handleItemClick(perk)}
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
        </div>
      </motion.div>

      {selectedItem && (
        <ItemDetailsPopup
          item={selectedItem}
          userItem={
            selectedItem.category === "seed"
              ? state.seeds.find((s) => s.item.slug === selectedItem.slug)
              : selectedItem.category === "crop"
              ? state.crops.find((c) => c.item.slug === selectedItem.slug)
              : state.perks.find((p) => p.item.slug === selectedItem.slug)
          }
          onClose={() => {
            setSelectedItem(null);
            setRequestQuantity(1); // Reset quantity when closing
          }}
          requestQuantity={requestQuantity}
          onRequestQuantityChange={setRequestQuantity}
          onRequest={() => handleRequestItem(selectedItem)}
          onUse={
            selectedItem.category === "perk"
              ? () => handleUseItem(selectedItem)
              : undefined
          }
        />
      )}
    </div>
  );
}
