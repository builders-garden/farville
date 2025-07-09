import { ClanHasQuestWithQuest } from "@/lib/prisma/types";
import ClanQuestCard from "./clan-quest-card";
import ClanQuestDialog from "./clan-quest-dialog";

interface ClanQuestProps {
  quest: ClanHasQuestWithQuest;
  refetchClanQuests: () => void;
  refetchClanData: () => void;
}

export default function ClanQuest({
  quest,
  refetchClanQuests,
  refetchClanData,
}: ClanQuestProps) {
  return (
    <ClanQuestDialog
      quest={quest}
      refetchClanQuests={refetchClanQuests}
      refetchClanData={refetchClanData}
    >
      <ClanQuestCard quest={quest}>
        <button className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-medium px-3 py-1 rounded shadow transition-colors duration-200">
          Fill
        </button>
      </ClanQuestCard>
    </ClanQuestDialog>
  );
}
