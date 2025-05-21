import { UserCommunityDonationEnhanced } from "@/lib/prisma/types";
import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";

export const useCommunityDonation = (mode: Mode, enabled = true) => {
  const queryParams = new URLSearchParams();
  queryParams.append("mode", mode);

  const url = `/api/community/donation${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return useApiQuery<UserCommunityDonationEnhanced[]>({
    url,
    queryKey: ["community-donations", mode],
    isProtected: true,
    enabled: enabled,
    staleTime: 60 * 1000,
  });
};
