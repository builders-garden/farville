import { DbItem } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useItem = (itemId: number) => {
  const { data, isLoading, error } = useApiQuery<DbItem>({
    url: `/api/items/${itemId}`,
    queryKey: ["item", itemId],
    isProtected: true,
  });

  return { data, isLoading, error };
};
