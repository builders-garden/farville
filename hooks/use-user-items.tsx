import { DbItem, DbUserHasItem } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export interface UserItem extends DbUserHasItem {
  item: DbItem;
}

export const useUserItems = () => {
  const { data, isLoading, refetch } = useApiQuery<UserItem[]>({
    queryKey: ["user-items"],
    url: "/api/users/me/items",
    isProtected: true,
  });

  return { userItems: data, isLoading, refetch };
};
