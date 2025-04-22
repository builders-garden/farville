import { UserHarvestedCrop } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useUserHarvestedCrops = (fid: number | undefined) => {
  const { data, isLoading, refetch } = useApiQuery<UserHarvestedCrop[]>({
    queryKey: ["user-harevested-crops", fid],
    url: `/api/users/${fid}/harvested-crops`,
    isProtected: true,
    enabled: !!fid,
  });

  return { userHarvestedCrops: data, isLoading, refetch };
};
