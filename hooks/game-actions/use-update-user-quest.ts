import { Mode, QuestStatus } from "@/lib/types/game";
import { useApiMutation } from "../use-api-mutation";
import { useAudio } from "@/context/AudioContext";
import sdk from "@farcaster/frame-sdk";

type UpdateUserQuestVariables = {
  questId: number;
  status: QuestStatus;
  mode: Mode;
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
    { success: boolean; status: QuestStatus; didLevelUp: boolean },
    UpdateUserQuestVariables
  >({
    url: (variables) => `/api/quests/${variables.questId}`,
    method: "POST",
    body: (variables) => ({ status: variables.status, mode: variables.mode }),
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
      sdk.haptics.impactOccurred("light");
    },
    onSuccess: async (variables) => {
      if (variables.status === "claimed") {
        playSound("claimQuest");
        await sdk.haptics.notificationOccurred("success");
      }
      if (variables.didLevelUp) {
        playSound("levelUp");
        await sdk.haptics.notificationOccurred("success");
      }
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
