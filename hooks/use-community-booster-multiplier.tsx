import { UserCommunityBoosterHistory } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useCommunityBoosterStatus = () => {
  const { data, isLoading, refetch } = useApiQuery<UserCommunityBoosterHistory>(
    {
      url: `/api/community/booster`,
      queryKey: ["user-community-booster-multiplier"],
      isProtected: true,
    }
  );

  return { userCommunityBoosterStatus: data, isLoading, refetch };
};
