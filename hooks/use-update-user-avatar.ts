import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";

export const useUpdateUserAvatar = ({
  setIsLoading,
  setUpdatedUserAvatar,
  refetchUser,
}: {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setUpdatedUserAvatar: Dispatch<SetStateAction<boolean>>;
  refetchUser: () => void;
}) => {
  return useApiMutation({
    url: () => `/api/users/me/collectibles/avatar`,
    body: ({
      collectibleId,
      reset,
    }: {
      collectibleId?: string;
      reset?: boolean;
    }) => ({
      collectibleId,
      reset,
    }),
    method: "POST",
    onSuccess: () => {
      setUpdatedUserAvatar(true);
      setIsLoading(false);
      refetchUser();
    },
    onError: () => {
      setIsLoading(false);
    },
  });
};
