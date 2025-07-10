import { ClanHasQuestWithQuest } from "@/lib/prisma/types";
import { motion } from "framer-motion";
import Image from "next/image";
import ClanQuestSilo from "./clan-quest-silo";

interface ClanQuestCardProps {
  quest: ClanHasQuestWithQuest;
  children: React.ReactNode;
  isCompleted?: boolean;
}

export default function ClanQuestCard({
  quest,
  children,
  isCompleted = false,
}: ClanQuestCardProps) {
  return (
    <motion.div
      key={quest.quest.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`px-4 py-3 rounded-lg flex flex-row gap-4 border shadow-lg ${
        isCompleted
          ? "bg-[#4a5d3a] border-green-600/50 opacity-75"
          : "bg-[#6d4c2c] border-[#8B5E3C]/50"
      }`}
    >
      {/* Left column: Quest info */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Crop image + name */}
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 flex items-center justify-center">
            <motion.div
              className="text-lg"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {quest.quest.category === "donate" && (
                <Image
                  src={`/images${quest.quest.item?.icon}` || "🧑‍🌾"}
                  width={28}
                  height={28}
                  alt={`Quest icon for ${quest.quest.category}`}
                  className={isCompleted ? "opacity-70" : ""}
                />
              )}
            </motion.div>
          </div>
          <h3
            className={`font-medium text-xs ${
              isCompleted ? "text-white/60" : "text-white/90"
            }`}
          >
            {quest.quest.item?.name} Silo
          </h3>
        </div>

        {/* Quest details */}
        <div className="flex flex-col gap-3">
          <p
            className={`text-xs ${
              isCompleted ? "text-white/50" : "text-white/70"
            }`}
          >
            {isCompleted
              ? `${quest.progress} filled`
              : `${quest.progress || 0}/${quest.quest.amount} needed`}
          </p>
          <span
            className={`font-medium flex items-center text-xs ${
              isCompleted ? "text-green-400/70" : "text-yellow-400"
            }`}
          >
            <span className="text-xs mr-1">⭐</span>
            {quest.quest.xp} {isCompleted && "earned"}
          </span>
          {quest.quest.endAt && !isCompleted && (
            <div className="text-white/50 text-[10px]">
              Ends:{" "}
              {(() => {
                const endTime = new Date(quest.quest.endAt).getTime();
                const timeRemaining = endTime - new Date().getTime();
                if (timeRemaining <= 0) return "Expired";

                const SECOND = 1000;
                const MINUTE = SECOND * 60;
                const HOUR = MINUTE * 60;
                const DAY = HOUR * 24;

                const days = Math.floor(timeRemaining / DAY);
                const hours = Math.floor((timeRemaining % DAY) / HOUR);
                const minutes = Math.floor((timeRemaining % HOUR) / MINUTE);

                if (days > 0) return `${days}d ${hours}h`;
                if (hours > 0) return `${hours}h ${minutes}m`;
                return `${minutes}m`;
              })()}
            </div>
          )}
          {quest.quest.endAt && isCompleted && (
            <div className="text-green-400/60 text-[10px]">Ended</div>
          )}
        </div>
      </div>

      {/* Right column: Silo at top, Fill button at bottom */}
      <div className="flex flex-col items-center justify-between gap-2">
        <ClanQuestSilo
          quest={quest}
          isCompleted={isCompleted}
        />
        {children}
      </div>
    </motion.div>
  );
}
