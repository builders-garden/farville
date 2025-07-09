import { ClanHasQuestWithQuest } from "@/lib/prisma/types";

interface ClanQuestSiloProps {
  quest: ClanHasQuestWithQuest;
  isCompleted?: boolean;
}

export default function ClanQuestSilo({
  quest,
  isCompleted = false,
}: ClanQuestSiloProps) {
  const progress = quest.progress || 0;
  const target = quest.quest.amount || 1;
  const fillPercentage = Math.min((progress / target) * 100, 100);

  return (
    <div
      className={`relative w-14 h-20 flex-shrink-0 mt-3 ${
        isCompleted ? "opacity-70" : ""
      }`}
    >
      {/* Silo structure - main body (shortened to not extend behind dome) */}
      <div
        className={`absolute top-3 left-0 right-0 bottom-0 bg-gradient-to-b rounded-b-lg border-2 border-t-0 shadow-lg ${
          isCompleted
            ? "from-[#5a6b4a] via-[#4a5d3a] to-[#3a4d2a] border-[#2a3a1a]"
            : "from-[#A67C52] via-[#8B5E3C] to-[#6d4c2c] border-[#4A3A2A]"
        }`}
      >
        {/* Fill indicator - fills the main body completely at 85% */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out ${
            isCompleted
              ? "bg-gradient-to-t from-[#8ab574] via-[#a5d188] to-[#bdf199]"
              : "bg-gradient-to-t from-[#D4A574] via-[#FFB938] to-[#FFA500]"
          }`}
          style={{
            height: `${(Math.min(fillPercentage, 85) / 85) * 100}%`,
            borderRadius: "0 0 6px 6px",
          }}
        >
          {/* Fill texture - grain effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
        </div>

        {/* Silo bands - more realistic - positioned above fill */}
        <div className="absolute top-3 left-1 right-1 h-[1px] bg-[#4A3A2A]/60 z-10"></div>
        <div className="absolute top-6 left-1 right-1 h-[1px] bg-[#4A3A2A]/60 z-10"></div>
        <div className="absolute top-9 left-1 right-1 h-[1px] bg-[#4A3A2A]/60 z-10"></div>
        <div className="absolute top-12 left-1 right-1 h-[1px] bg-[#4A3A2A]/60 z-10"></div>
        <div className="absolute top-15 left-1 right-1 h-[1px] bg-[#4A3A2A]/60 z-10"></div>

        {/* Silo door/access panel - positioned above fill */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-[#4A3A2A]/80 rounded-sm z-10"></div>
      </div>

      {/* Circular silo top/dome */}
      <div
        className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-14 h-7 bg-gradient-to-b rounded-t-full border-2 shadow-lg overflow-hidden ${
          isCompleted
            ? "from-[#6b7c5b] to-[#5a6b4a] border-[#2a3a1a]"
            : "from-[#B8906B] to-[#A67C52] border-[#4A3A2A]"
        }`}
      >
        {/* Dome fill - only shows when main body is mostly filled */}
        {fillPercentage > 85 && (
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out ${
              isCompleted
                ? "bg-gradient-to-t from-[#8ab574] via-[#a5d188] to-[#bdf199]"
                : "bg-gradient-to-t from-[#D4A574] via-[#FFB938] to-[#FFA500]"
            }`}
            style={{
              height: `${((fillPercentage - 85) / 15) * 100}%`,
            }}
          >
            {/* Fill texture for dome */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
          </div>
        )}
      </div>

      {/* Top highlight for dome effect - positioned last to stay on top */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-gradient-to-b from-white/20 to-transparent rounded-t-full"></div>
    </div>
  );
}
