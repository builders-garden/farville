import { useMutation } from "@tanstack/react-query";

export const useSellItem = () => {
  const mutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "POST",
        body: JSON.stringify({ action: "sell", quantity }),
      });
      return res.json();
    },
  });

  return mutation;
};
