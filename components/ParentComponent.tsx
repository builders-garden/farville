import React, { useState } from "react";
import { DbUserHasQuestWithQuest } from "../types/dbUserHasQuestWithQuest";
import Quest from "./Quest";

const ParentComponent: React.FC = () => {
  const [quests, setQuests] = useState<DbUserHasQuestWithQuest[]>([]);

  const handleQuestClaim = (questId: string) => {
    setQuests((prevQuests) =>
      prevQuests.filter((quest) => quest.questId !== questId)
    );
  };

  return (
    <div>
      {quests.map((quest) => (
        <Quest
          key={quest.id}
          quest={quest}
          claimable={isQuestClaimable(quest)}
          onClaim={handleQuestClaim}
        />
      ))}
    </div>
  );
};

export default ParentComponent;
