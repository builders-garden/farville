import { useApiMutation } from "@/hooks/use-api-mutation";
import { Mode } from "@/lib/types/game";

interface InitializationProps {
  mode: Mode;
}

export const useInitializeMode = ({
  refetchUser,
  refetchUserItems,
  refetchUserGrid,
  isActionInProgress,
  setIsActionInProgress,
}: {
  refetchUser: () => void;
  refetchUserItems: () => void;
  refetchUserGrid: () => void;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
}) => {
  return useApiMutation<unknown, InitializationProps>({
    url: `/api/mode/initialize`,
    body: ({ mode }) => ({
      mode,
    }),
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: () => {
      refetchUser();
      refetchUserItems();
      refetchUserGrid();
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
