import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";
import { UserCommunityDonation } from "@prisma/client";

export const useCommunityDonation = (mode: Mode, enabled = true) => {
  const queryParams = new URLSearchParams();
  queryParams.append("mode", mode);

  const url = `/api/user-community-donation${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return useApiQuery<
    (UserCommunityDonation & {
      user: {
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        selectedAvatarUrl: string | null;
        mintedOG: boolean;
      };
    })[]
  >({
    url,
    queryKey: ["community-donations", mode],
    isProtected: true,
    enabled: enabled,
    staleTime: 60 * 1000,
  });
};
