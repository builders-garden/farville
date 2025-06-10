import { useApiQuery } from "./use-api-query";
import { ClanWithData } from "@/lib/prisma/types";

export const useClan = (id?: string) => {
  const { data, isLoading, refetch } = useApiQuery<ClanWithData>({
    queryKey: ["clan", id],
    url: `/api/clan/${id}`,
    isProtected: true,
    enabled: !!id,
  });

  return { clanData: data, isLoading, refetch };
};
