import {
  UserCommunityBoosterHistory,
  UserCommunityDonation,
} from "@prisma/client";
import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";
import { Mode } from "@/lib/types/game";

export const useCommunityBoosterStatus = (mode: Mode) => {
  const { data, isLoading, refetch } = useApiQuery<
    UserCommunityBoosterHistory & {
      donation: UserCommunityDonation;
      points: number;
      combo: number;
    }
  >({
    url: `/api/community/booster?mode=${mode}`,
    queryKey: ["user-community-booster-multiplier", mode],
    isProtected: true,
  });

  return { userCommunityBoosterStatus: data, isLoading, refetch };
};

export const useCommunityBoosterIncrement = () => {
  return useApiMutation<
    {
      message: string;
      data: {
        donationId: string;
      };
    },
    {
      paymentId: string;
      message?: string;
      username: string;
      mode: Mode;
    }
  >({
    url: () => `/api/community/booster`,
    method: "POST",
    body: (data) => ({
      paymentId: data.paymentId,
      message: data.message,
      username: data.username,
      mode: data.mode,
    }),
    onSuccess: (data) => {
      console.log("Points successfully updated:", data);
      return data.data;
    },
    onError: (error) => {
      console.error("Error updating points:", error);
    },
  });
};
