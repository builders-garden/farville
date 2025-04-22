import { Mode, QuestStatus } from "@/lib/types/game";
import { getUserHasQuests } from "@/lib/prisma/queries";
import { prisma } from "@/lib/prisma/client";

export const calculateUserQuestsProgress = async (
  fid: number,
  category: string,
  itemId?: number,
  itemAmount: number = 1
) => {
  // Get all quests that are incomplete and match the category and itemId
  const quests = await getUserHasQuests(
    fid,
    Mode.Classic,
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

  // Filter eligible quests and process updates
  const questUpdates = await Promise.all(
    quests
      .filter(
        (quest) =>
          quest.quest && (!quest.quest.itemId || quest.quest.itemId === itemId)
      )
      .map(async (quest) => {
        return prisma.$transaction(async (tx) => {
          // Get current progress and increment it atomically
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

          // If completed, update the status in the same transaction
          if (updated.progress >= (quest.quest!.amount || 1)) {
            return tx.userHasQuest.update({
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

          return updated;
        });
      })
  );

  return questUpdates;
};
