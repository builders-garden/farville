import { getUserQuests, updateUserQuest } from "@/supabase/queries";

import { DbUserHasQuestStatus } from "@/supabase/types";
import { QuestStatus } from "@/types/game";

export const calculateUserQuestsProgress = async (
  fid: number,
  category: string,
  itemId?: number,
  itemAmount: number = 1
) => {
  // Get all quests that require harvesting this crop
  const quests = await getUserQuests(fid, {
    status: QuestStatus.Incomplete,
    category,
    itemId,
  });

  if (!quests?.length) {
    return [];
  }

  // Filter eligible quests and prepare updates
  const questUpdates = quests
    .filter(
      (quest) =>
        quest.quest && (!quest.quest.itemId || quest.quest.itemId === itemId)
    )
    .map((quest) => {
      const newProgress = Math.min(
        quest.progress + itemAmount,
        quest.quest!.amount || 1
      );
      const completed = newProgress >= (quest.quest!.amount || 1);

      return {
        fid,
        questId: quest.questId,
        updates: {
          progress: newProgress,
          status: completed
            ? ("completed" as DbUserHasQuestStatus)
            : ("incomplete" as DbUserHasQuestStatus),
          completedAt: completed ? new Date().toISOString() : null,
        },
      };
    });

  if (!questUpdates.length) {
    return [];
  }

  // Batch update all quests at once
  const updatedQuests = await Promise.all(
    questUpdates.map(({ fid, questId, updates }) =>
      updateUserQuest(fid, questId, updates)
    )
  );

  // Single log for all updates
  console.log(
    `[${new Date().toISOString()}] Updated ${
      updatedQuests.length
    } quests for user ${fid}. ` +
      `Completed: ${
        updatedQuests.filter((q) => q.status === "completed").length
      }`
  );

  return updatedQuests;
};
