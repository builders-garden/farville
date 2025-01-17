import { useUpdateUserQuest } from "@/hooks/game-actions/use-update-user-quest";
import {
  DbQuest,
  DbQuestWithItem,
  DbUserHasQuestWithQuest,
} from "@/supabase/types";
import { motion } from "framer-motion";
import Image from "next/image";

interface QuestProps {
  quest: DbUserHasQuestWithQuest;
  claimable: boolean;
  onClaim?: (questId: number, x: number, y: number, didLevelUp: boolean) => void;
}

const renderQuestRewards = (quest: DbQuest) => (
  <div className="flex items-center gap-2 text-xs mt-2">
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
      <div className="flex items-center gap-2 text-xs mt-2">
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
  const { mutate: updateUserQuest } = useUpdateUserQuest();
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
        <div className="flex flex-col gap-2">
          <h3 className="text-white/90 font-medium">
            {quest.quest.category.charAt(0).toUpperCase() +
              quest.quest.category.slice(1)}{" "}
            Quest
          </h3>
          <p className="text-white/60 text-xs">
            {questDescription(quest.quest)}
          </p>
          {renderQuestRewards(quest.quest)}
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
                  const timeRemaining = endTime - Date.now();
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
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = rect.x + rect.width / 2;
              const y = rect.y + rect.height / 2;

              updateUserQuest(
                { questId: quest.questId, status: "claimed" },
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
    </motion.div>
  );
}
