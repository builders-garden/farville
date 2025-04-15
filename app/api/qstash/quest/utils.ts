import { updateUserQuest } from "@/supabase/queries";

import { DbUserHasQuestStatus } from "@/supabase/types";
import { QuestStatus } from "@/lib/types/game";
import { getUserHasQuests } from "@/lib/prisma/queries";

export const calculateUserQuestsProgress = async (
  fid: number,
  category: string,
  itemId?: number,
  itemAmount: number = 1
) => {
  // Get all quests that are incomplete and match the category and itemId
  const quests = await getUserHasQuests(
    fid,
    {
      status: QuestStatus.Incomplete,
      category,
      itemId,
    },
    {
      quest: true,
    }
  );

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

  return updatedQuests;
};
