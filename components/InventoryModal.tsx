"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { useFrameContext } from "../context/FrameContext";
import { UserItem } from "@/hooks/use-user-items";
import Image from "next/image";
import ItemDetailsPopup from "./ItemDetailsPopup";
import { useState } from "react";
import { requestItemComposeCastUrl } from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import { useCreateRequest } from "@/hooks/game-actions/use-create-request";
import InventoryItem from "./InventoryItem";
import { Item } from "@prisma/client";

export default function InventoryModal({ onClose }: { onClose: () => void }) {
  const { state, setSelectedSeed, setSelectedPerk } = useGame();
  const { safeAreaInsets, context } = useFrameContext();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const { mutate: createRequest } = useCreateRequest();
  const [castUrl, setCastUrl] = useState<string | null>(null);
  const [requestUrl, setRequestUrl] = useState<string | null>(null);

  const handlePerkClick = (perk: UserItem) => {
    if (perk.quantity && perk.quantity > 0) {
      setSelectedPerk(perk);
      setSelectedSeed(null);
      onClose();
    }
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  const handleUseItem = (item: Item) => {
    if (item.category === "perk") {
      const userPerk = state.perks.find((p) => p.item.slug === item.slug);
      if (userPerk) {
        handlePerkClick(userPerk);
      }
    }
    setSelectedItem(null);
  };

  const handleRequestItem = async (item: Item) => {
    if (!context?.user.fid) return;

    try {
      await createRequest(
        {
          itemId: item.id,
          quantity: requestQuantity,
        },
        {
          onSuccess: async (data) => {
            const { castUrl, requestUrl } = requestItemComposeCastUrl(
              data.id,
              item,
              requestQuantity
            );
            setCastUrl(castUrl);
            setRequestUrl(requestUrl);
          },
          onError: (error) => {
            console.error("Error creating requests", error);
          },
        }
      );
    } catch (error) {
      console.error("Error handling request:", error);
    }
  };

  const handleShareRequest = async () => {
    if (!castUrl || !requestUrl) return;

    try {
      await sdk.actions.openUrl(castUrl);
      setSelectedItem(null);
      setRequestQuantity(1);
    } catch (error) {
      console.error("Error sharing request URL:", error);
    }
  };

  // Render categories section
  const renderCategorySection = (
    category: string,
    icon: string,
    title: string
  ) => {
    const filteredItems = state.items.filter(
      (item) => item.category === category
    );

    // Get the appropriate collection based on category
    const userItems =
      category === "seed"
        ? state.seeds
        : category === "crop"
        ? state.crops
        : category === "special-crop"
        ? state.specialCrops
        : state.perks;

    const isImageUrl = icon.startsWith("http") || icon.startsWith("/");

    return (
      <div>
        <motion.h3
          className="text-white/90 font-bold text-lg mb-4 flex items-center gap-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {isImageUrl ? (
            <Image src={icon} alt={title} width={28} height={28} />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
          {title}
        </motion.h3>
        <div className="grid grid-cols-6 gap-4 md:grid-cols-8">
          {filteredItems.map((item) => {
            const userItem = userItems.find((ui) => ui.item.slug === item.slug);
            const quantity = userItem?.quantity || 0;

            return (
              <InventoryItem
                key={item.id}
                item={item}
                quantity={quantity}
                onClick={() => {
                  if (category !== "special-crop") {
                    handleItemClick(item);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    );
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

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto p-6">
            <div className="space-y-8">
              {renderCategorySection("seed", "🌱", "Seeds")}
              {renderCategorySection("crop", "🌾", "Harvested Crops")}
              {renderCategorySection("perk", "✨", "Perks")}
              {renderCategorySection(
                "special-crop",
                "/images/special/gold.png",
                "Gold Crops"
              )}
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
            setRequestUrl(null);
            setCastUrl(null);
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
          onShareRequest={handleShareRequest}
          requestUrl={requestUrl}
        />
      )}
    </div>
  );
}
