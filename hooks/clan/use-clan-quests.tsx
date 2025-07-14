import { useApiQuery } from "../use-api-query";
import { ClanHasQuestWithQuest } from "@/lib/prisma/types";

export const useClanQuests = (clanId: string | undefined, status: string) => {
  const url = clanId
    ? `/api/clan/${clanId}/quests?status=${status}&activeToday=${
        status === "incomplete" ? "true" : "false"
      }`
    : "";

  const {
    data: quests,
    isLoading,
    refetch,
  } = useApiQuery<{
    quests: ClanHasQuestWithQuest[];
  }>({
    queryKey: ["clans", clanId, "quests", status],
    url,
    isProtected: true,
    enabled: !!clanId,
    staleTime: 30000,
  });

  return {
    quests: quests?.quests || [],
    isLoading,
    refetch,
  };
};
