import { useGame } from "@/context/GameContext";
import { useApiMutation } from "../use-api-mutation";
import { Mode } from "@/lib/types/game";

interface GiftFertilizersVariables {
  mode: Mode;
}

interface GiftFertilizersResponse {
  message: string;
}

export const useGiftFertilizers = () => {
  const { state, setIsActionInProgress, refetchUserItems } = useGame();

  const { mutateAsync: giftFertilizers } = useApiMutation<
    GiftFertilizersResponse,
    GiftFertilizersVariables
  >({
    url: "/api/gift-fertilizers",
    body: (variables) => ({
      fid: state.user.fid,
      mode: variables.mode,
    }),
    onMutate: () => {
      setIsActionInProgress(true);
    },
    onSuccess: () => {
      refetchUserItems();
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });

  return { giftFertilizers };
};
