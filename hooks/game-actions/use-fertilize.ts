"use client";

import { useMutation } from "@tanstack/react-query";

export const useFertilize = ({
  refetchGridCells,
  refetchUserItems,
}: {
  refetchGridCells: () => Promise<void>;
  refetchUserItems: () => Promise<void>;
}) => {
  const mutation = useMutation({
    mutationFn: async ({ x, y }: { x: number; y: number }) => {
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
  });

  return mutation;
};
