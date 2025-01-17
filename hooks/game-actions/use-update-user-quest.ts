import { DbUserHasQuestStatus } from "@/supabase/types";
import { useApiMutation } from "../use-api-mutation";
import { useAudio } from "@/context/AudioContext";

type UpdateUserQuestVariables = {
  questId: number;
  status: DbUserHasQuestStatus;
  didLevelUp: boolean;
};

export const useUpdateUserQuest = () => {
  const { playSound } = useAudio();
  return useApiMutation<
    { success: boolean; status: DbUserHasQuestStatus; didLevelUp: boolean },
    UpdateUserQuestVariables
  >({
    url: (variables) => `/api/quests/${variables.questId}`,
    method: "POST",
    body: (variables) => ({ status: variables.status }),
    onSuccess: (variables) => {
      if (variables.status === "claimed") {
        playSound("claimQuest");
      }
      if (variables.didLevelUp) {
        playSound("levelUp");
      }
    },
  });
};
