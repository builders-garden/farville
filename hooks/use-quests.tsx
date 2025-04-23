import { QuestWithItem, UserHasQuestWithQuest } from "@/lib/prisma/types";
import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";

export const useQuests = (mode: Mode) => {
  const {
    data: allQuests,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useApiQuery<QuestWithItem[]>({
    queryKey: ["quests", mode],
    url: `/api/quests?mode=${mode}`,
    isProtected: true,
  });

  const {
    data: activeQuests,
    isLoading: isLoadingActive,
    refetch: refetchActive,
  } = useApiQuery<QuestWithItem[]>({
    queryKey: ["quests", "active"],
    url: "/api/quests?active=true",
    isProtected: true,
  });

  return {
    quests: allQuests,
    activeQuests,
    isLoading: isLoadingAll || isLoadingActive,
    refetch: {
      all: refetchAll,
      active: refetchActive,
    },
  };
};

export const useQuest = (id: number, mode: Mode) => {
  const { data, isLoading, refetch } = useApiQuery<QuestWithItem | null>({
    queryKey: ["quests", id, mode],
    url: `/api/quests/${id}?mode=${mode}`,
    isProtected: true,
  });

  return {
    quest: data,
    isLoading,
    refetch,
  };
};

export const useUserQuests = (
  fid: number | undefined,
  status: string,
  mode: Mode
) => {
  const {
    data: quests,
    isLoading,
    refetch,
  } = useApiQuery<{
    daily: UserHasQuestWithQuest[];
    weekly: UserHasQuestWithQuest[];
  }>({
    queryKey: ["users", fid, "quests", status, mode],
    url: `/api/users/${fid}/quests?status=${status}&activeToday=${
      status === "incomplete" ? "true" : "false"
    }&mode=${mode}`,
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

export const useUserQuest = (
  fid: number | undefined,
  questId: number,
  mode: Mode
) => {
  const { data, isLoading, refetch } =
    useApiQuery<UserHasQuestWithQuest | null>({
      queryKey: ["users", fid, "quests", questId, mode],
      url: `/api/users/${fid}/quests/${questId}?mode=${mode}`,
      isProtected: true,
      enabled: !!fid,
    });

  return {
    quest: data,
    isLoading,
    refetch,
  };
};
