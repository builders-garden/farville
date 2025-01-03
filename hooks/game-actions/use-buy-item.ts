import { useMutation } from "@tanstack/react-query";

export const useBuyItem = () => {
  const mutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      const res = await fetch(`/api/users/meitems/${itemId}`, {
        method: "POST",
        body: JSON.stringify({ action: "buy", quantity }),
      });
      return res.json();
    },
  });

  return mutation;
};
