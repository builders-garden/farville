import { DbItem, DbUserHasItem } from "@/supabase/types";
import { useQuery } from "@tanstack/react-query";

export interface UserItem extends DbUserHasItem {
  item: DbItem;
}

export const useItems = () => {
  const { data, isLoading, refetch } = useQuery<UserItem[]>({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await fetch("/api/items");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      return response.json();
    },
  });

  return { items: data, isLoading, refetch };
};
