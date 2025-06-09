import { useApiQuery } from "./use-api-query";
import { UserClan } from "@/lib/prisma/types";

export const useUserClan = (targetFid?: number) => {
  const url = targetFid ? `/api/users/${targetFid}/clan` : "";

  const { data, isLoading, refetch } = useApiQuery<UserClan>({
    url,
    queryKey: ["clan", targetFid],
    isProtected: true,
    enabled: !!targetFid,
  });

  return { userClan: data, isLoading, refetch };
};
