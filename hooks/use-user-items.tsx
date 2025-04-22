import { useApiQuery } from "./use-api-query";
import { Item, UserHasItem } from "@prisma/client";

export interface UserItem extends UserHasItem {
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
