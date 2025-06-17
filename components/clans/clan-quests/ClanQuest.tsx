import { ClanHasQuestWithQuest } from "@/lib/prisma/types";
import { motion } from "framer-motion";
import Image from "next/image";

interface ClanQuestProps {
  quest: ClanHasQuestWithQuest;
}

const renderClanQuestRewards = (quest: ClanHasQuestWithQuest["quest"]) => (
  <div className="flex items-center justify-between text-xs mt-2 gap-2">
    <span className="text-white/60 flex items-center">
      <span>XP</span>
      <span className="text-yellow-400 font-medium flex items-center">
        <span className="text-sm mb-1 ml-1 mr-0.5">⭐</span>
        {quest.xp}
      </span>
    </span>
    <button
      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow transition-colors duration-200 w-fit"
      onClick={() => {
        // TODO: Implement donate logic
        alert("Donate clicked!");
      }}
    >
      Fill
    </button>
  </div>
);

const renderClanQuestProgress = (quest: ClanHasQuestWithQuest) => {
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

const clanQuestDescription = (quest: ClanHasQuestWithQuest["quest"]) => {
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
      start = "Fill";
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
    end = quest.item?.name.toLowerCase() || end;
  }
  return `${start} ${quest.amount} ${end}`;
};

export default function ClanQuest({ quest }: ClanQuestProps) {
  return (
    <motion.div
      key={quest.quest.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col gap-2 border border-[#8B5E3C]/50 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <motion.div
            className="text-2xl"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {quest.quest.category === "donate" && (
              <Image
                src={`/images${quest.quest.item?.icon}` || "🧑‍🌾"}
                width={40}
                height={40}
                alt={`Quest icon for ${quest.quest.category}`}
              />
            )}
          </motion.div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-white/90 font-medium">
              {quest.quest.category === "donate" && "Fill the Crate"}
            </h3>
          </div>
          <p className="text-white/60 text-xs">
            {clanQuestDescription(quest.quest)}
          </p>
          {renderClanQuestRewards(quest.quest)}
        </div>
      </div>
      {renderClanQuestProgress(quest)}
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs">
          {quest.quest.endAt && (
            <span className="ml-auto">
              Ends in:{" "}
              {(() => {
                const endTime = new Date(quest.quest.endAt).getTime();
                const timeRemaining = endTime - new Date().getTime();
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
    </motion.div>
  );
}
