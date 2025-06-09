import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import {
  hapticsImpactOccurred,
  hapticsNotificationOccurred,
} from "@/lib/farcaster";

interface ClaimRewardVariables {
  streakId: string;
}

export const useClaimReward = ({
  refetchUserItems,
  refetchStreaks,
  isActionInProgress,
  setIsActionInProgress,
}: {
  refetchUserItems: () => void;
  refetchStreaks: () => void;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
}) => {
  const { playSound } = useAudio();

  return useApiMutation<unknown, ClaimRewardVariables>({
    url: () => `/api/users/me/rewards/claim`,
    body: ({ streakId }) => ({ streakId }),
    onMutate: async () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
      await hapticsImpactOccurred("light");
    },
    onSuccess: async () => {
      refetchUserItems();
      refetchStreaks();
      playSound("claimQuest");
      await hapticsNotificationOccurred("success");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
