import {
  DbQuest,
  DbQuestWithItem,
  DbUserHasQuestWithQuest,
} from "@/supabase/types";
import { motion } from "framer-motion";
import Image from "next/image";

interface QuestProps {
  quest: DbUserHasQuestWithQuest;
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
    <div className="relative w-full bg-[#5c4121] rounded-full h-5 my-2">
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
  if (quest.amount && quest.itemId) {
    return `${quest.category === "harvest" ? "Harvest" : "Collect"} ${
      quest.amount
    } ${quest.items?.name.toLowerCase()}`;
  } else if (quest.amount) {
    let start = "";
    switch (quest.category) {
      case "harvest":
        start = "Harvest";
        break;
      case "plant":
        start = "Plant";
        break;
      case "fertilize":
        start = "Fertilize";
        break;
      case "donate":
        start = "Donate";
        break;
      default:
        start = "Complete";
        break;
    }
    let end = "";
    switch (quest.category) {
      case "harvest":
        end = "crops";
        break;
      case "plant":
        end = "seeds";
        break;
      case "fertilize":
        end = "crops";
        break;
      case "donate":
        end = "items";
        break;
      default:
        end = "the quest";
        break;
    }
    return `${start} ${quest.amount} ${end}`;
  } else {
    return "Complete the quest";
  }
};

export default function Quest({ quest }: QuestProps) {
  return (
    <motion.div
      key={quest.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col gap-2
                               border border-[#8B5E3C]/50 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <motion.div
            className="text-2xl"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Image
              src={`/images${quest.quest.items?.icon}` || "/icons/quest.svg"}
              width={40}
              height={40}
              alt={`Quest icon for ${quest.quest.category}`}
            />
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
      {renderQuestProgress(quest)}
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs">
          {quest.quest.endAt && (
            <span className="ml-auto">
              Ends in:{" "}
              {(() => {
                const timeRemaining =
                  new Date(quest.quest.endAt).getTime() - Date.now();
                if (timeRemaining <= 0) return "";

                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
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
    </motion.div>
  );
}
