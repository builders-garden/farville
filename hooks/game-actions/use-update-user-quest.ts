import { DbUserHasQuestStatus } from "@/supabase/types";
import { useApiMutation } from "../use-api-mutation";
import { useAudio } from "@/context/AudioContext";

type UpdateUserQuestVariables = {
  questId: number;
  status: DbUserHasQuestStatus;
};

export const useUpdateUserQuest = () => {
  const { playSound } = useAudio();
  return useApiMutation<
    { success: boolean; status: DbUserHasQuestStatus },
    UpdateUserQuestVariables
  >({
    url: (variables) => `/api/quests/${variables.questId}`,
    method: "POST",
    body: (variables) => ({ status: variables.status }),
    onSuccess: (variables) => {
      console.log(variables);
      if (variables.status === "claimed") {
        playSound("claimQuest");
      }
    },
  });
};
