import { UserHasQuestStatus } from "@prisma/client";
import { useApiMutation } from "../use-api-mutation";
import { useAudio } from "@/context/AudioContext";

type UpdateUserQuestVariables = {
  questId: number;
  status: UserHasQuestStatus;
};

export const useUpdateUserQuest = ({
  isActionInProgress,
  setIsActionInProgress,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
}) => {
  const { playSound } = useAudio();
  return useApiMutation<
    { success: boolean; status: UserHasQuestStatus; didLevelUp: boolean },
    UpdateUserQuestVariables
  >({
    url: (variables) => `/api/quests/${variables.questId}`,
    method: "POST",
    body: (variables) => ({ status: variables.status }),
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: (variables) => {
      if (variables.status === "claimed") {
        playSound("claimQuest");
      }
      if (variables.didLevelUp) {
        playSound("levelUp");
      }
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
