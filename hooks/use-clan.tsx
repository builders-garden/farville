import { Clan } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useClan = (strToSearch?: string, isPublic: boolean = false) => {
  const { data, isLoading, refetch } = useApiQuery<Clan[]>({
    queryKey: ["clans", strToSearch, isPublic],
    url: `/api/clan?search=${strToSearch || ""}&isPublic=${isPublic}`,
    isProtected: true,
  });

  return { items: data, isLoading, refetch };
};
