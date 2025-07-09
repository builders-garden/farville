import { ClanHasQuestWithQuest } from "@/lib/prisma/types";
import ClanQuestCard from "./clan-quest-card";
import ClanQuestDialog from "./clan-quest-dialog";

interface ClanQuestProps {
  quest: ClanHasQuestWithQuest;
  refetchClanQuests: () => void;
  refetchClanData: () => void;
  isCompleted?: boolean;
}

export default function ClanQuest({
  quest,
  refetchClanQuests,
  refetchClanData,
  isCompleted = false,
}: ClanQuestProps) {
  return (
    <ClanQuestCard
      quest={quest}
      isCompleted={isCompleted}
    >
      {!isCompleted && (
        <ClanQuestDialog
          quest={quest}
          refetchClanQuests={refetchClanQuests}
          refetchClanData={refetchClanData}
        >
          <button className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-medium px-3 py-1 rounded shadow transition-colors duration-200">
            Fill
          </button>
        </ClanQuestDialog>
      )}
      {isCompleted && (
        <div className="bg-green-600 text-white text-[9px] font-medium px-3 py-1 rounded shadow flex items-center gap-1">
          <span>✓</span>
          Complete
        </div>
      )}
    </ClanQuestCard>
  );
}
