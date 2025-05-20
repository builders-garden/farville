import { UserCommunityBoosterHistory } from "@prisma/client";
import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";
import { Mode } from "@/lib/types/game";

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

export const useCommunityBoosterIncrement = () => {
  return useApiMutation<
    {
      message: string;
      data: {
        points: number;
      };
    },
    {
      points: number;
      txHash: string;
      walletAddress: string;
      dollarAmount: number;
      message?: string;
      username: string;
      mode: Mode;
    }
  >({
    url: () => `/api/community/booster`,
    method: "POST",
    body: (data) => ({
      points: data.points,
      txHash: data.txHash,
      walletAddress: data.walletAddress,
      dollarAmount: data.dollarAmount,
      message: data.message,
      username: data.username,
      mode: data.mode,
    }),
    onSuccess: (data) => {
      console.log("Points successfully updated:", data);
    },
    onError: (error) => {
      console.error("Error updating points:", error);
    },
  });
};
