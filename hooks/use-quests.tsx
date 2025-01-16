import { DbQuestWithItem, DbUserHasQuestWithQuest } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useQuests = () => {
  const {
    data: allQuests,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useApiQuery<DbQuestWithItem[]>({
    queryKey: ["quests"],
    url: "/api/quests",
    isProtected: true,
  });

  const {
    data: activeQuests,
    isLoading: isLoadingActive,
    refetch: refetchActive,
  } = useApiQuery<DbQuestWithItem[]>({
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

export const useQuest = (id: number) => {
  const { data, isLoading, refetch } = useApiQuery<DbQuestWithItem | null>({
    queryKey: ["quests", id],
    url: `/api/quests/${id}`,
    isProtected: true,
  });

  return {
    quest: data,
    isLoading,
    refetch,
  };
};

export const useUserQuests = (fid: number | undefined, status: string) => {
  const {
    data: quests,
    isLoading,
    refetch,
  } = useApiQuery<{
    daily: DbUserHasQuestWithQuest[];
    weekly: DbUserHasQuestWithQuest[];
    monthly: DbUserHasQuestWithQuest[];
    farmer: DbUserHasQuestWithQuest[];
  }>({
    queryKey: ["users", fid, "quests", status],
    url: `/api/users/${fid}/quests?status=${status}`,
    isProtected: true,
    enabled: !!fid,
  });

  return {
    quests,
    isLoading,
    refetch,
  };
};

export const useUserQuest = (fid: number | undefined, questId: number) => {
  const { data, isLoading, refetch } =
    useApiQuery<DbUserHasQuestWithQuest | null>({
      queryKey: ["users", fid, "quests", questId],
      url: `/api/users/${fid}/quests/${questId}`,
      isProtected: true,
      enabled: !!fid,
    });

  return {
    quest: data,
    isLoading,
    refetch,
  };
};
