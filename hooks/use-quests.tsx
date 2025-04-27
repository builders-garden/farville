import { UserHasQuestWithQuest } from "@/lib/prisma/types";
import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";

export const useUserQuests = (
  fid: number | undefined,
  status: string,
  mode: Mode
) => {
  const url = fid
    ? `/api/users/${fid}/quests?status=${status}&activeToday=${
        status === "incomplete" ? "true" : "false"
      }&mode=${mode}`
    : "";

  const {
    data: quests,
    isLoading,
    refetch,
  } = useApiQuery<{
    daily: UserHasQuestWithQuest[];
    weekly: UserHasQuestWithQuest[];
  }>({
    queryKey: ["users", fid, "quests", status, mode],
    url,
    isProtected: true,
    enabled: !!fid,
    staleTime: 30000,
  });

  return {
    quests,
    isLoading,
    refetch,
  };
};
