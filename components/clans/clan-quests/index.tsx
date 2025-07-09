import { Card, CardContent } from "../../ui/card";
import { ClanHasQuestWithQuest } from "@/lib/prisma/types";
import ClanQuest from "./clan-quest";
import ClanQuestTabs, { QuestTab } from "./clan-quest-tabs";
import { useState } from "react";

interface ClanQuestsProps {
  activeQuests: ClanHasQuestWithQuest[];
  completedQuests: ClanHasQuestWithQuest[];
  refetchActiveQuests: () => void;
  refetchCompletedQuests: () => void;
  refetchClanData: () => void;
}

export function ClanQuests({
  activeQuests,
  completedQuests,
  refetchActiveQuests,
  refetchCompletedQuests,
  refetchClanData,
}: ClanQuestsProps) {
  const [activeTab, setActiveTab] = useState<QuestTab>("active");
  const hasCompletedQuests = completedQuests.length > 0;

  const currentQuests = activeTab === "active" ? activeQuests : completedQuests;
  const currentRefetch =
    activeTab === "active" ? refetchActiveQuests : refetchCompletedQuests;

  return (
    <div className="flex flex-col w-full">
      {/* Subtabs */}
      <ClanQuestTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasCompletedQuests={hasCompletedQuests}
      />

      {/* Quest content */}
      {currentQuests.length === 0 ? (
        <Card className={`border-none cursor-pointer bg-[#5B4120]/90`}>
          <CardContent className="flex flex-col justify-center items-center p-3 text-center gap-3">
            <p className="text-md font-bold text-amber-200">
              👨🏻‍🌾 {activeTab === "completed" ? "Completed " : ""}Feud Quests 👨🏻‍🌾
            </p>
            <p className="text-xs text-white/80">
              {activeTab === "completed"
                ? "No completed quests for this week yet."
                : "No active quests available for your feud at the moment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col w-full gap-4">
          {currentQuests.map((quest) => (
            <ClanQuest
              key={quest.quest.id}
              quest={quest}
              refetchClanQuests={currentRefetch}
              refetchClanData={refetchClanData}
              isCompleted={activeTab === "completed"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
