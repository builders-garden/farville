import { getUserQuests, updateUserQuest } from "@/supabase/queries";
import { DbUserHasQuest } from "@/supabase/types";

export const calculateUserQuestsProgress = async (
  fid: number,
  category: string,
  itemId?: number,
  itemAmount: number = 1
) => {
  // Get all quests that require harvesting this crop
  const quests = await getUserQuests(fid, {
    status: "incomplete",
    category,
  });
  if (!quests) {
    return null;
  }
  console.log(
    `[${new Date().toISOString()}] found ${
      quests.length
    } quests for user ${fid}`
  );

  const updatedQuests: DbUserHasQuest[] = [];
  // Update progress for each quest
  await Promise.all(
    quests.map(async (quest) => {
      if (
        quest.quest &&
        (quest.quest.itemId === null || quest.quest?.itemId === itemId)
      ) {
        let newProgress = quest.progress + itemAmount;
        const completed = newProgress >= (quest.quest?.amount || 1);

        if (completed) {
          newProgress = quest.quest?.amount || 1;
        }

        const updatedQuest = await updateUserQuest(fid, quest.questId, {
          progress: newProgress,
          status: completed ? "completed" : "incomplete",
          completedAt: completed ? new Date().toISOString() : null,
        });
        updatedQuests.push(updatedQuest);
        console.log(
          `[${new Date().toISOString()}] updated quest with id ${
            quest.questId
          } for user ${fid}`
        );
        if (completed) {
          console.log(
            `[${new Date().toISOString()}] completed quest with id ${
              quest.questId
            } for user ${fid}`
          );
        }
        return updatedQuest;
      } else {
        return quest;
      }
    })
  );

  return updatedQuests;
};
