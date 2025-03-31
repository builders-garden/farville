import { useGame } from "@/context/GameContext";
import { useUpdateUserQuest } from "@/hooks/game-actions/use-update-user-quest";
import { getUserNowDate, requestItemComposeCastUrl } from "@/lib/utils";
import {
  DbQuest,
  DbQuestWithItem,
  DbUserHasQuestWithQuest,
} from "@/supabase/types";
import { QuestStatus } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import ItemDetailsPopup from "./ItemDetailsPopup";
import { useFrameContext } from "@/context/FrameContext";
import { useCreateRequest } from "@/hooks/game-actions/use-create-request";
import sdk from "@farcaster/frame-sdk";
import RequestButton from "./ui/request-button";

interface QuestProps {
  quest: DbUserHasQuestWithQuest;
  claimable: boolean;
  onClaim?: (
    questId: number,
    x: number,
    y: number,
    didLevelUp: boolean
  ) => void;
}

const renderQuestRewards = (
  quest: DbQuest,
  showRequestButton = false,
  onRequestClick: () => void
) => (
  <div className="flex items-center justify-between text-xs mt-2">
    <div className="flex items-center gap-2">
      {quest.xp && (
        <span className="text-white/60 flex items-center">
          XP{" "}
          <span className="text-yellow-400 font-medium flex items-center">
            <span className="text-sm mb-1 ml-1 mr-0.5">⭐</span>
            {quest.xp}
          </span>
        </span>
      )}
      {quest.coins !== null && quest.coins !== undefined && quest.coins > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40">•</span>
          <span className="text-white/60 flex items-center">
            Coins{" "}
            <span className="text-[#FFB938] font-medium flex items-center">
              <span className="text-sm mb-1 ml-1 mr-0.5">🪙</span>
              {quest.coins}
            </span>
          </span>
        </div>
      )}
    </div>

    {showRequestButton && (
      <RequestButton
        variant="secondary"
        onClick={onRequestClick}
      />
    )}
  </div>
);

const renderQuestProgress = (quest: DbUserHasQuestWithQuest) => {
  const progress = quest.progress || 0;
  const target = quest.quest.amount || 1;

  return (
    <div className={`relative w-full bg-[#5c4121] rounded-full h-5 my-2`}>
      <div
        className="bg-[#f2a311] h-5 rounded-full transition-all duration-300"
        style={{ width: `${(progress / target) * 100}%` }}
      >
        <div className="absolute w-full text-center text-xs text-white/80 mt-[3px]">
          {progress}/{target}
        </div>
      </div>
    </div>
  );
};

const questDescription = (quest: DbQuestWithItem) => {
  let start = "";
  let end = "";
  switch (quest.category) {
    case "harvest":
      start = "Harvest";
      end = "crops";
      break;
    case "plant":
      start = "Plant";
      end = "seeds";
      break;
    case "fertilize":
      start = "Fertilize";
      end = "crops";
      break;
    case "donate":
      start = "Donate";
      end = "items";
      break;
    case "sell":
      start = "Sell";
      end = "crops";
      break;
    case "receive":
      start = "Receive";
      end = "items";
      break;
    default:
      start = "Complete";
      end = "the quest";
      break;
  }
  if (quest.amount && quest.itemId) {
    end = quest.items?.name.toLowerCase() || end;
  }
  return `${start} ${quest.amount} ${end}`;
};

export default function Quest({
  quest,
  claimable = false,
  onClaim,
}: QuestProps) {
  const { isActionInProgress, setIsActionInProgress, state } = useGame();
  const { context } = useFrameContext();
  const { mutate: updateUserQuest, isPending } = useUpdateUserQuest({
    isActionInProgress,
    setIsActionInProgress,
  });
  const { mutate: createRequest } = useCreateRequest();
  const [selectedItem, setSelectedItem] = useState<
    DbQuestWithItem["items"] | null
  >(null);
  const [requestQuantity, setRequestQuantity] = useState(
    quest.quest.amount || 1
  );
  const [castUrl, setCastUrl] = useState<string | null>(null);
  const [requestUrl, setRequestUrl] = useState<string | null>(null);

  // Handle showing item details
  const handleShowItemDetails = () => {
    if (quest.quest.items) {
      setSelectedItem(quest.quest.items);
    }
  };

  // Find user item from inventory if it exists
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

  // Handle requesting an item - similar to InventoryModal
  const handleRequestItem = async () => {
    if (!context?.user.fid || !selectedItem) return;

    try {
      createRequest(
        {
          itemId: selectedItem.id,
          quantity: requestQuantity,
        },
        {
          onSuccess: async (data) => {
            const { castUrl, requestUrl } = requestItemComposeCastUrl(
              data.id,
              selectedItem,
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

  const handleCopyRequest = async () => {
    if (!requestUrl) return;

    try {
      await navigator.clipboard.writeText(requestUrl);
      console.log("Request URL copied to clipboard:", requestUrl);
    } catch (error) {
      console.error("Error copying request URL:", error);
    }
  };

  const handleShareRequest = async () => {
    if (!castUrl || !requestUrl) return;

    try {
      await navigator.clipboard.writeText(requestUrl);
      await sdk.actions.openUrl(castUrl);
      setSelectedItem(null);
      setRequestQuantity(1);
    } catch (error) {
      console.error("Error sharing request URL:", error);
    }
  };

  return (
    <motion.div
      key={quest.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col gap-2
                               border border-[#8B5E3C]/50 shadow-lg ${
                                 claimable && "bg-[#db9d00]"
                               }`}
    >
      <div className={`flex items-center gap-3`}>
        <div className="w-10 h-10 flex items-center justify-center">
          <motion.div
            className="text-2xl"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {(quest.quest.category === "plant" ||
              quest.quest.category === "harvest") && (
              <Image
                src={`/images${quest.quest.items?.icon}` || "🧑‍🌾"}
                width={40}
                height={40}
                alt={`Quest icon for ${quest.quest.category}`}
              />
            )}
            {quest.quest.category === "fertilize" && "🧪"}
            {quest.quest.category === "donate" && "🎁"}
            {quest.quest.category === "sell" && "💰"}
            {quest.quest.category === "receive" && "🤝"}
          </motion.div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-white/90 font-medium">
              {quest.quest.category.charAt(0).toUpperCase() +
                quest.quest.category.slice(1)}{" "}
              Quest
            </h3>
          </div>
          <p className="text-white/60 text-xs">
            {questDescription(quest.quest)}
          </p>
          {renderQuestRewards(
            quest.quest,
            !claimable &&
              quest.quest.category === "receive" &&
              !!quest.quest.items,
            handleShowItemDetails
          )}
        </div>
      </div>
      {!claimable && renderQuestProgress(quest)}
      {!claimable && (
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">
            {quest.quest.endAt && (
              <span className="ml-auto">
                Ends in:{" "}
                {(() => {
                  const endTime = new Date(quest.quest.endAt).getTime();
                  const timeRemaining = endTime - getUserNowDate().getTime();
                  if (timeRemaining <= 0) return "";

                  const SECOND = 1000;
                  const MINUTE = SECOND * 60;
                  const HOUR = MINUTE * 60;
                  const DAY = HOUR * 24;

                  const days = Math.floor(timeRemaining / DAY);
                  const hours = Math.floor((timeRemaining % DAY) / HOUR);
                  const minutes = Math.floor((timeRemaining % HOUR) / MINUTE);
                  const seconds = Math.floor((timeRemaining % MINUTE) / SECOND);

                  const parts = [];
                  if (days > 0) parts.push(`${days}d`);
                  if (hours > 0) parts.push(`${hours}h`);
                  if (minutes > 0) parts.push(`${minutes}m`);
                  else parts.push(`${seconds}s`);

                  return parts.join(" ");
                })()}
              </span>
            )}
          </span>
        </div>
      )}
      {claimable && (
        <div className="flex flex-col items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending || isActionInProgress}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = rect.x + rect.width / 2;
              const y = rect.y + rect.height / 2;

              updateUserQuest(
                { questId: quest.questId, status: QuestStatus.Claimed },
                {
                  onSuccess: (data) => {
                    onClaim?.(quest.questId, x, y, data.didLevelUp);
                  },
                }
              );
            }}
            className="bg-[#8B5E3C] hover:bg-[#9d6b45] text-white/90 text-sm font-medium px-4 py-2.5 my-2 rounded-lg 
               shadow-lg transition-colors duration-200 border border-[#a17347]/30 w-full"
          >
            CLAIM
          </motion.button>
        </div>
      )}

      {/* Item Details Popup */}
      {selectedItem && (
        <ItemDetailsPopup
          item={selectedItem}
          userItem={findUserItem(selectedItem.slug)}
          onClose={() => {
            setSelectedItem(null);
            setRequestQuantity(quest.quest.amount || 1);
            setCastUrl(null);
            setRequestUrl(null);
          }}
          requestQuantity={requestQuantity}
          onRequestQuantityChange={setRequestQuantity}
          onRequest={handleRequestItem}
          onCopyRequest={handleCopyRequest}
          onShareRequest={handleShareRequest}
          urlReady={!!requestUrl}
        />
      )}
    </motion.div>
  );
}
