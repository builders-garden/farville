import { useApiQuery } from "./use-api-query";
import { ClanWithMembers } from "@/lib/prisma/types";

export const useClan = (id?: string) => {
  const { data, isLoading, refetch } = useApiQuery<ClanWithMembers>({
    queryKey: ["clan", id],
    url: `/api/clan/${id}`,
    isProtected: true,
    enabled: !!id,
  });

  return { clanData: data, isLoading, refetch };
};
