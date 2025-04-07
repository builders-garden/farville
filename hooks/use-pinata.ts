import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";
import { DbUserHasCollectible } from "@/supabase/types";

export const usePinata = ({
  setMetadataCID,
  setConfirmedSelection,
  handleUpdateStateCollectibles,
}: {
  setMetadataCID: Dispatch<SetStateAction<string | null>>;
  setConfirmedSelection: Dispatch<SetStateAction<boolean>>;
  handleUpdateStateCollectibles: (
    userHasCollectibles: DbUserHasCollectible
  ) => void;
}) => {
  return useApiMutation({
    url: () => `/api/pfp-nft-pinata`,
    body: ({
      imageUrl,
      fid,
      collectibleId,
    }: {
      imageUrl: string;
      fid: number;
      collectibleId: number;
    }) => ({
      imageUrl,
      fid,
      collectibleId,
    }),
    method: "POST",
    onSuccess: (data: {
      imageUrl: string;
      imageMetadataUrl: string;
      imageCID: string;
      metadataUrl: string;
      metadataCID: string;
      userHasCollectible: DbUserHasCollectible;
    }) => {
      setMetadataCID(data.metadataCID);
      setConfirmedSelection(true);
      handleUpdateStateCollectibles(data.userHasCollectible);
    },
  });
};
