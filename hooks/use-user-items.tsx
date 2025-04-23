import { Mode } from "@/lib/types/game";
import { useApiQuery } from "./use-api-query";
import { Item, UserHasItem } from "@prisma/client";

export interface UserItem extends UserHasItem {
  item: Item;
}

export const useUserItems = (mode: Mode = Mode.Classic, fid?: number) => {
  const { data, isLoading, refetch } = useApiQuery<UserItem[]>({
    queryKey: ["user-items", fid, mode],
    url: !fid
      ? `/api/users/me/items?mode=${mode}`
      : `/api/users/${fid}/items?mode=${mode}`,
    isProtected: true,
  });

  return { userItems: data, isLoading, refetch };
};
