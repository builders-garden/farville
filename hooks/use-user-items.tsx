import { DbItem, DbUserHasItem } from "@/supabase/types";
import { useQuery } from "@tanstack/react-query";

export interface UserItem extends DbUserHasItem {
  item: DbItem;
}

export const useUserItems = () => {
  const { data, isLoading, refetch } = useQuery<UserItem[]>({
    queryKey: ["user-items"],
    queryFn: async () => {
      const response = await fetch("/api/users/me/items");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      return response.json();
    },
  });

  return { userItems: data, isLoading, refetch };
};
