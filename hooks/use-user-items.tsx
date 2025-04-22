import { Item, DbUserHasItem } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export interface UserItem extends DbUserHasItem {
  item: Item;
}

export const useUserItems = (fid?: number) => {
  const { data, isLoading, refetch } = useApiQuery<UserItem[]>({
    queryKey: ["user-items", fid],
    url: !fid ? "/api/users/me/items" : `/api/users/${fid}/items`,
    isProtected: true,
  });

  return { userItems: data, isLoading, refetch };
};
