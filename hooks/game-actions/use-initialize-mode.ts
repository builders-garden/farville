import { useApiMutation } from "@/hooks/use-api-mutation";
import { Mode } from "@/lib/types/game";

interface InitializationProps {
  mode: Mode;
}

export const useInitializeMode = ({
  refetchUser,
  refetchUserItems,
  refetchUserGrid,
  refetchUserModes,
  isActionInProgress,
  setIsActionInProgress,
}: {
  refetchUser: () => void;
  refetchUserItems: () => void;
  refetchUserGrid: () => void;
  refetchUserModes: () => void;
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
      refetchUserModes();
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
