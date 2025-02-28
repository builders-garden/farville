import { DbUserHarvestedCrop } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useUserHarvestedCrops = (fid: number | undefined) => {
  const { data, isLoading, refetch } = useApiQuery<DbUserHarvestedCrop[]>({
    queryKey: ["user-harevested-crops", fid],
    url: `/api/users/${fid}/harvested-crops`,
    isProtected: true,
    enabled: !!fid,
  });

  return { userHarvestedCrops: data, isLoading, refetch };
};
