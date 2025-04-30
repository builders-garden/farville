import { Mode } from "@/lib/types/game";
import { useApiQuery } from "./use-api-query";
import { DbUserDonationWithUsers } from "@/lib/prisma/queries";

export const useDonationHistory = (
  mode: Mode,
  donator?: number,
  receiver?: number
) => {
  const { data, isLoading } = useApiQuery<
    {
      todayDonations: DbUserDonationWithUsers[];
      canDonateToReceiver: boolean;
      canDonateToAnotherUser: boolean;
    },
    { donator?: number; receiver?: number }
  >({
    queryKey: ["donationHistory", donator, receiver, mode],
    url: `/api/donation-history?donator=${donator}&receiver=${receiver}&mode=${mode}`,
    method: "GET",
    isProtected: true,
    enabled: !!donator && !!receiver,
  });

  const { todayDonations, canDonateToReceiver, canDonateToAnotherUser } =
    data || {};

  return {
    todayDonations,
    canDonateToReceiver,
    canDonateToAnotherUser,
    isLoading,
  };
};
