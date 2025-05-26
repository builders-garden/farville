import { Mode, QuestStatus } from "@/lib/types/game";
import { getUserHasQuests } from "@/lib/prisma/queries";
import { prisma } from "@/lib/prisma/client";

export const calculateUserQuestsProgress = async (
  fid: number,
  mode: Mode,
  category: string,
  itemId?: number,
  itemAmount: number = 1
) => {
  // Get all quests that are incomplete and match the category and itemId
  const quests = await getUserHasQuests(
    fid,
    mode,
    {
      status: QuestStatus.Incomplete,
      category,
      itemId,
      activeToday: true,
    },
    {
      quest: true,
    }
  );

  if (!quests?.length) {
    return [];
  }

  // Filter eligible quests
  const eligibleQuests = quests.filter(
    (quest) =>
      quest.quest && (!quest.quest.itemId || quest.quest.itemId === itemId)
  );

  if (!eligibleQuests.length) {
    return [];
  }

  // Batch update all eligible quests in a single transaction
  const updatedQuestIds: number[] = [];
  await prisma.$transaction(async (tx) => {
    for (const quest of eligibleQuests) {
      // Atomically increment progress and check if completed
      const updated = await tx.userHasQuest.update({
        where: {
          fid_questId: {
            fid,
            questId: quest.questId,
          },
        },
        data: {
          progress: {
            increment: itemAmount,
          },
        },
      });

      // If completed, update status in the same transaction
      if (updated.progress + itemAmount >= (quest.quest!.amount || 1)) {
        await tx.userHasQuest.update({
          where: {
            fid_questId: {
              fid,
              questId: quest.questId,
            },
          },
          data: {
            status: QuestStatus.Completed,
            completedAt: new Date(),
          },
        });
      }
      updatedQuestIds.push(quest.questId);
    }
  });

  // Fetch and return the updated quests for consistent return values
  const updatedQuests = await prisma.userHasQuest.findMany({
    where: {
      fid,
      questId: { in: updatedQuestIds },
    },
    include: { quest: true },
  });

  return updatedQuests;
};
