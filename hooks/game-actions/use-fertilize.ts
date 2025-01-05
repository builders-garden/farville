"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";

export const useFertilize = ({
  isActionInProgress,
  setIsActionInProgress,
  refetchGridCells,
  refetchUserItems,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  refetchGridCells: () => Promise<void>;
  refetchUserItems: () => Promise<void>;
}) => {
  const mutation = useApiMutation({
    url: ({ x, y }: { x: number; y: number }) => `/api/grid-cells/${x}/${y}`,
    body: () => ({ action: "fertilize" }),
    onSuccess: () => {
      refetchGridCells();
      refetchUserItems();
    },
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });

  return mutation;
};
