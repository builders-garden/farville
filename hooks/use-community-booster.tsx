import { UserCommunityBoosterHistory } from "@prisma/client";
import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";

export const useCommunityBoosterStatus = () => {
  const { data, isLoading, refetch } = useApiQuery<
    UserCommunityBoosterHistory & {
      points: number;
    }
  >({
    url: `/api/community/booster`,
    queryKey: ["user-community-booster-multiplier"],
    isProtected: true,
  });

  return { userCommunityBoosterStatus: data, isLoading, refetch };
};

export const useCommunityBoosterManagement = () => {
  return useApiMutation<
    {
      message: string;
      data: {
        points: number;
      };
    },
    {
      points: number;
      operation: "increment" | "decrement";
    }
  >({
    url: () => `/api/community/booster`,
    method: "POST",
    body: ({
      points,
      operation,
    }: {
      points: number;
      operation: "increment" | "decrement";
    }) => ({
      points,
      operation,
    }),
    onSuccess: (data) => {
      console.log("Points successfully updated:", data);
    },
    onError: (error) => {
      console.error("Error updating points:", error);
    },
  });
};
