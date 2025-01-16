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
    {quest.coins && (
      <>
        <span className="text-white/40">•</span>
        <span className="text-white/60 flex items-center">
          Coins{" "}
          <span className="text-[#FFB938] font-medium flex items-center">
            <span className="text-sm mb-1 ml-1 mr-0.5">🪙</span>
            {quest.coins}
          </span>
        </span>
      </>
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

export default function Quest({ quest, claimable = false }: QuestProps) {
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
                src={
                  `/images${quest.quest.items?.icon}` || "/images/default.png"
                }
                width={40}
                height={40}
                alt={`Quest icon for ${quest.quest.category}`}
              />
            )}
            {quest.quest.category === "fertilize" && "🧪"}
            {quest.quest.category === "donate" && "🎁"}
            {quest.quest.category === "sell" && "💰"}
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
          {!claimable && renderQuestRewards(quest.quest)}
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
                  const timeRemaining =
                    new Date(quest.quest.endAt).getTime() - Date.now();
                  if (timeRemaining <= 0) return "";

                  const days = Math.floor(
                    timeRemaining / (1000 * 60 * 60 * 24)
                  );
                  const hours = Math.floor(
                    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  const minutes = Math.floor(
                    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  const seconds = Math.floor(
                    (timeRemaining % (1000 * 60)) / 1000
                  );

                  return `${days > 0 ? `${days}d ` : ""}
                                  ${hours > 0 ? `${hours}h ` : ""}
                                    ${
                                      minutes > 0
                                        ? `${minutes}m`
                                        : `${seconds}s`
                                    }`;
                })()}
              </span>
            )}
          </span>
        </div>
      )}
      {claimable && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#8B5E3C] hover:bg-[#9d6b45] text-white/90 text-sm font-medium px-4 py-2.5 my-2 rounded-lg 
               shadow-lg transition-colors duration-200 border border-[#a17347]/30 w-full"
        >
          <div className="flex items-center justify-center gap-2">
            {quest.quest.xp && (
              <span className="flex items-center">
                <span className="text-yellow-400 mt-[-5px] mx-2">⭐</span>
                {quest.quest.xp} XP
              </span>
            )}
            {quest.quest.xp && quest.quest.coins && (
              <span className="text-white/40">•</span>
            )}
            {quest.quest.coins && (
              <span className="flex items-center">
                <span className="text-[#FFB938] mt-[-5px] mx-2">🪙</span>
                {quest.quest.coins} Coins
              </span>
            )}
          </div>
        </motion.button>
      )}
    </motion.div>
  );
}
