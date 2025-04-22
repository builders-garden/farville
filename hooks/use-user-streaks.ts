import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";
import { Streak } from "@prisma/client";

export const useUserStreaks = (fid?: number) => {
  const { data, isLoading, refetch } = useApiQuery<Streak[]>({
    queryKey: ["user-streaks", fid],
    url: !fid ? "/api/users/me/streaks" : `/api/users/${fid}/streaks`,
    isProtected: true,
  });

  return { userStreaks: data, isLoading, refetch };
};

export const useUpdateUserStreaks = ({
  refetchStreaks,
  refetchUserItems,
  refetchFrosts,
}: {
  refetchStreaks: () => void;
  refetchUserItems: () => void;
  refetchFrosts: () => void;
}) => {
  return useApiMutation<unknown>({
    url: () => `/api/users/me/streaks`,
    onSuccess: () => {
      refetchStreaks();
      refetchUserItems();
      refetchFrosts();
    },
  });
};

export const useUpdateUserFrosts = ({
  refetchStreaks,
  refetchUserItems,
  refetchFrosts,
}: {
  refetchStreaks: () => void;
  refetchUserItems: () => void;
  refetchFrosts: () => void;
}) => {
  return useApiMutation<void>({
    url: "/api/users/me/frosts",
    onSuccess: () => {
      refetchStreaks();
      refetchUserItems();
      refetchFrosts();
    },
    mutationKey: ["update-user-frosts"],
  });
};
