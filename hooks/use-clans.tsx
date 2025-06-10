import { Clan } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useClans = (strToSearch?: string, isPublic?: boolean) => {
  const { data, isLoading, refetch } = useApiQuery<Clan[]>({
    queryKey: ["clans", strToSearch, isPublic],
    url: `/api/clan?search=${strToSearch || ""}${
      isPublic !== undefined ? `&isPublic=${isPublic}` : ""
    }`,
    isProtected: true,
  });

  return { items: data, isLoading, refetch };
};
