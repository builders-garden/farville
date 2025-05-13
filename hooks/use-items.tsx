import { Item } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useItems = () => {
  const { data, isLoading, refetch } = useApiQuery<Item[]>({
    queryKey: ["items"],
    url: "/api/items",
    isProtected: true,
  });

  return { items: data, isLoading, refetch };
};
