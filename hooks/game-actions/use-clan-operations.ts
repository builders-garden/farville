import { useApiMutation } from "../use-api-mutation";

export const useClanOperations = () => {
  const { mutate: createClan } = useApiMutation({
    url: () => `/api/clan`,
    body: (clanData: {
      name: string;
      motto: string;
      isPublic?: boolean;
      txHash?: string;
    }) => clanData,
    method: "POST",
    onSuccess: (data) => {
      console.log("Clan created successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error creating clan:", error);
    },
  });

  const { mutate: joinClan } = useApiMutation({
    url: () => `/api/clan/join`,
    body: (clanId: string) => ({ clanId }),
    method: "POST",
    onSuccess: (data) => {
      console.log("Joined clan successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error joining clan:", error);
    },
  });

  return {
    createClan,
    joinClan,
  };
};
