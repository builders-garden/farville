import { DbUserDonation } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useDonationHistory = (donator?: number, receiver?: number) => {
  const { data, isLoading } = useApiQuery<
    {
      lastDonation: DbUserDonation;
      donationsLast24h: number;
    },
    { donator?: number; receiver?: number }
  >({
    queryKey: ["donationHistory", donator, receiver],
    url: `/api/donation-history?donator=${donator}&receiver=${receiver}`,
    method: "GET",
    isProtected: true,
    enabled: !!donator && !!receiver,
  });

  const { lastDonation, donationsLast24h } = data || {};

  return { donationsLast24h, lastDonation, isLoading };
};
