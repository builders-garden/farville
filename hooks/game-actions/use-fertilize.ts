"use client";

import { useMutation } from "@tanstack/react-query";

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
  const mutation = useMutation({
    mutationFn: async ({ x, y }: { x: number; y: number }) => {
      if (isActionInProgress) return;

      setIsActionInProgress(true);
      const res = await fetch(`/api/grid-cells/${x}/${y}`, {
        method: "POST",
        body: JSON.stringify({ action: "fertilize" }),
      });
      return res.json();
    },
    onSuccess: () => {
      refetchGridCells();
      refetchUserItems();
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });

  return mutation;
};
