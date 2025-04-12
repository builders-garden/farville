import { useApiQuery } from "./use-api-query";
import { DbUserDonationWithUsers } from "@/lib/prisma/queries";

export const useDonationHistory = (donator?: number, receiver?: number) => {
  const { data, isLoading } = useApiQuery<
    {
      todayDonations: DbUserDonationWithUsers[];
      canDonateToReceiver: boolean;
      canDonateToAnotherUser: boolean;
    },
    { donator?: number; receiver?: number }
  >({
    queryKey: ["donationHistory", donator, receiver],
    url: `/api/donation-history?donator=${donator}&receiver=${receiver}`,
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
