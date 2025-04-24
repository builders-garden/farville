"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { CROP_DATA } from "@/lib/game-constants";
import Image from "next/image";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import ItemDetailsPopup from "@/components/ItemDetailsPopup";
import { useFrameContext } from "@/context/FrameContext";
import { useCreateRequest } from "@/hooks/game-actions/use-create-request";
import sdk from "@farcaster/frame-sdk";
import {
  getGrowthTimeBasedOnMode,
  requestItemComposeCastUrl,
} from "@/lib/utils";
import MarketplaceTabs, { Tab } from "./MarketplaceTabs";
import MarketplaceItem from "./MarketplaceItem";
import PerkItem from "./PerkItem";
import ExpansionPanel from "./ExpansionPanel";
import ItemDetailsModal from "./ItemDetailsModal";
import { useNextStep } from "nextstepjs";
import { Item } from "@prisma/client";
import { CropType } from "@/lib/types/game";

// Add new type for selected item details
type SelectedItemDetails = {
  id: number;
  name: string;
  icon: string;
  buyPrice: number | null;
  harvestXp?: number;
  description: string | null;
  growthTime?: number;
  cropData: Item;
} | null;

export default function MarketplaceModal({
  onClose,
  safeAreaInsets,
}: {
  onClose: () => void;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const { mode, state, buyItem, sellItem, expandGrid, isActionInProgress } =
    useGame();
  const { context } = useFrameContext();
  const { mutate: createRequest } = useCreateRequest();
  const [activeTab, setActiveTab] = useState<Tab>("buy");
  const [buySubTab, setBuySubTab] = useState<"seeds" | "perks">("seeds");
  const [confirmAction, setConfirmAction] = useState<{
    type: "buy" | "sell";
    itemId: number;
    quantity: number;
    itemName: string;
    price: number;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItemDetails>(null);
  const [selectedItemForRequest, setSelectedItemForRequest] =
    useState<Item | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [castUrl, setCastUrl] = useState<string | null>(null);
  const [requestUrl, setRequestUrl] = useState<string | null>(null);

  const gridSize = state.gridSize.width * state.gridSize.height;

  const { startNextStep } = useNextStep();

  useEffect(() => {
    if (state.showMarketplaceTutorial) {
      startNextStep("marketplaceTour");
    }
  }, []);

  // Handle requesting an item
  const handleRequestItem = async () => {
    if (!context?.user.fid || !selectedItemForRequest) return;

    try {
      createRequest(
        {
          itemId: selectedItemForRequest.id,
          quantity: requestQuantity,
        },
        {
          onSuccess: async (data) => {
            const { castUrl, requestUrl } = requestItemComposeCastUrl(
              data.id,
              selectedItemForRequest,
              requestQuantity
            );
            setCastUrl(castUrl);
            setRequestUrl(requestUrl);
          },
          onError: (error) => {
            console.error("Error creating request", error);
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
      setSelectedItemForRequest(null);
      setRequestQuantity(1);
    } catch (error) {
      console.error("Error sharing request URL:", error);
    }
  };

  // Find user item from inventory
  const findUserItem = (itemSlug: string) => {
    const userItem = state.items.find((item) => item.slug === itemSlug);
    if (!userItem) return undefined;

    const userInventoryItem = [
      ...state.seeds,
      ...state.crops,
      ...state.perks,
    ].find((ui) => ui.item.slug === itemSlug);

    return userInventoryItem;
  };

  // Handle item selection for viewing details
  const handleItemSelect = (item: Item) => {
    if (item.category === "seed") {
      const crop = state.items.find(
        (i) => i.slug === item.slug.replace("-seeds", "")
      )!;
      const itemDetails = {
        id: item.id,
        name: item.name,
        icon: item.icon,
        buyPrice: item.buyPrice,
        cropData: crop,
        harvestXp: CROP_DATA[item.slug.replace("-seeds", "")]?.rewardXP,
        description: item.description,
        growthTime:
          getGrowthTimeBasedOnMode(
            item.slug.replace("-seeds", "") as CropType,
            mode
          ) /
          (60000 * 60),
      };
      setSelectedItem(itemDetails);
    }
  };

  // Handle buy/sell button click
  const handleBuySellClick = (itemId: number, quantity: number) => {
    const item = state.items.find((item) => item.id === itemId)!;
    if (!item) return;

    if (item.category === "crop") {
      // For crops (selling)
      const actualQuantity =
        quantity === -1
          ? state.crops.find((crop) => crop.itemId === itemId)?.quantity || 0
          : quantity;

      if (actualQuantity > 1) {
        setConfirmAction({
          type: "sell",
          itemId,
          quantity: actualQuantity,
          itemName: item.name,
          price: (item.sellPrice || 0) * actualQuantity,
        });
      } else {
        sellItem({ itemId, quantity: 1, mode });
      }
    } else {
      // For seeds and perks (buying)
      if (quantity >= 5) {
        setConfirmAction({
          type: "buy",
          itemId,
          quantity,
          itemName: item.name,
          price: (item.buyPrice || 0) * quantity,
        });
      } else {
        buyItem({ itemId, quantity, mode });
      }
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
        className="bg-[#7E4E31] w-full h-screen flex flex-col"
      >
        <div className="max-w-4xl mx-auto w-full p-4 mt-2 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between mb-2 xs:mb-4 flex-shrink-0">
            <div className="flex flex-col gap-0.5 xs:gap-1">
              <motion.h2
                className="text-white/90 font-bold text-xl xs:text-2xl mb-0 xs:mb-1 flex items-center gap-1 xs:gap-2"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <Image
                  src="/images/icons/market.png"
                  alt="Market"
                  width={20}
                  height={20}
                  className="w-5 h-5 xs:w-6 xs:h-6"
                />
                Market
              </motion.h2>
              <motion.p
                className="text-white/70 text-xs xs:text-sm flex items-center gap-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Your coins:{" "}
                <span className="flex items-center gap-1 text-[#FFB938] ">
                  <span className="font-bold mb-1">🪙</span>
                  {state.coins}
                </span>
              </motion.p>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 xs:w-8 xs:h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center hover:rotate-90 transform duration-200"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <MarketplaceTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Sub tabs */}
          {activeTab === "buy" && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                className={`px-4 py-1.5 rounded-lg text-[10px] transition-colors ${
                  buySubTab === "seeds"
                    ? "bg-[#9E6B49] text-white"
                    : "bg-black/20 text-white/70 hover:bg-black/30"
                }`}
                onClick={() => setBuySubTab("seeds")}
              >
                🌱 Seeds
              </button>
              <button
                className={`px-4 py-1.5 rounded-lg text-[10px] transition-colors ${
                  buySubTab === "perks"
                    ? "bg-[#9E6B49] text-white"
                    : "bg-black/20 text-white/70 hover:bg-black/30"
                }`}
                onClick={() => setBuySubTab("perks")}
              >
                ✨ Perks
              </button>
            </div>
          )}

          {/* Content area */}
          <div className="overflow-y-auto flex-1 -mr-2 pr-2 no-scrollbar">
            {/* buy Tab */}
            {activeTab === "buy" && (
              <motion.div
                className="grid gap-3 pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {buySubTab === "seeds" && (
                  <>
                    <div className="text-white/60 text-[10px] text-center mb-1 italic">
                      Click on any seed to view detailed information
                    </div>
                    {state.items
                      .filter((item) => item.category === "seed")
                      .map((item, index) => (
                        <MarketplaceItem
                          key={item.slug}
                          item={item}
                          ownedQuantity={
                            state.seeds.find((seed) => seed.item.id === item.id)
                              ?.quantity || 0
                          }
                          index={index}
                          isLevelRequired={state.level < item.requiredLevel}
                          requiredLevel={item.requiredLevel}
                          onItemSelect={handleItemSelect}
                          onRequestClick={setSelectedItemForRequest}
                          onBuyClick={handleBuySellClick}
                          gridSize={gridSize}
                          userCoins={state.coins}
                        />
                      ))}
                  </>
                )}

                {buySubTab === "perks" && (
                  <div className="grid gap-3">
                    {state.items
                      .filter((item) => item.category === "perk")
                      .map((perk) => {
                        const ownedQuantity =
                          state.perks.find((p) => p.itemId === perk.id)
                            ?.quantity || 0;

                        return (
                          <PerkItem
                            key={perk.id}
                            perk={perk}
                            ownedQuantity={ownedQuantity}
                            onBuyClick={handleBuySellClick}
                            gridSize={gridSize}
                            userCoins={state.coins}
                          />
                        );
                      })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Sell Tab */}
            {activeTab === "sell" && (
              <motion.div
                className="grid gap-3 pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {state.items
                  .filter((item) => item.category === "crop")
                  .map((item, index) => {
                    const amount =
                      state.crops.find((crop) => crop.itemId === item.id)
                        ?.quantity || 0;
                    return (
                      <MarketplaceItem
                        key={item.slug}
                        item={item}
                        ownedQuantity={amount}
                        index={index}
                        isLevelRequired={false}
                        onItemSelect={() => {}}
                        onRequestClick={setSelectedItemForRequest}
                        onBuyClick={handleBuySellClick}
                        gridSize={gridSize}
                        userCoins={state.coins}
                      />
                    );
                  })}
              </motion.div>
            )}

            {/* Expansions Tab */}
            {activeTab === "expansions" && (
              <motion.div
                className="pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <ExpansionPanel
                  expansionLevel={state.expansionLevel}
                  userLevel={state.level}
                  userCoins={state.coins}
                  onExpand={expandGrid}
                />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Popups and modals */}
      {selectedItemForRequest && (
        <ItemDetailsPopup
          item={selectedItemForRequest}
          userItem={findUserItem(selectedItemForRequest.slug)}
          onClose={() => {
            setSelectedItemForRequest(null);
            setRequestQuantity(1);
            setRequestUrl(null);
            setCastUrl(null);
          }}
          requestQuantity={requestQuantity}
          onRequestQuantityChange={setRequestQuantity}
          onRequest={handleRequestItem}
          onShareRequest={handleShareRequest}
          requestUrl={requestUrl}
        />
      )}

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
                mode,
              });
            } else {
              sellItem({
                itemId: confirmAction.itemId,
                quantity: confirmAction.quantity,
                mode,
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

      {/* Use the new ItemDetailsModal component */}
      {selectedItem && (
        <ItemDetailsModal
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
