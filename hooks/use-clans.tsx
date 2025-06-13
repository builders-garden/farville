import { useApiQuery } from "./use-api-query";
import { ClanWithMembers } from "@/lib/prisma/types";

export const useClans = (strToSearch?: string, isPublic?: boolean) => {
  const { data, isLoading, refetch } = useApiQuery<ClanWithMembers[]>({
    queryKey: ["clans", strToSearch, isPublic],
    url: `/api/clan?search=${strToSearch || ""}${
      isPublic !== undefined ? `&isPublic=${isPublic}` : ""
    }`,
    isProtected: true,
  });

  return { items: data, isLoading, refetch };
};
