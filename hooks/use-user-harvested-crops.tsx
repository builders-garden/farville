import { UserHarvestedCrop } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useUserHarvestedCrops = (fid: number | undefined) => {
  const url = fid ? `/api/users/${fid}/harvested-crops` : "";

  const { data, isLoading, refetch } = useApiQuery<UserHarvestedCrop[]>({
    queryKey: ["user-harevested-crops", fid],
    url,
    isProtected: true,
    enabled: !!fid,
  });

  return { userHarvestedCrops: data, isLoading, refetch };
};
