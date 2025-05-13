import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";
import { UserHasCollectible } from "@prisma/client";

export const usePinata = ({
  setPinataMetadataCID,
  setConfirmedSelection,
  handleUpdateStateCollectibles,
}: {
  setPinataMetadataCID: Dispatch<SetStateAction<string | null>>;
  setConfirmedSelection: Dispatch<SetStateAction<boolean>>;
  handleUpdateStateCollectibles: (
    userHasCollectibles: UserHasCollectible
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
      success: boolean;
      data: {
        imageUrl: string;
        imageMetadataUrl: string;
        imageCID: string;
        metadataUrl: string;
        metadataCID: string;
        userHasCollectible: UserHasCollectible;
      };
    }) => {
      console.log("data", data);
      setPinataMetadataCID(data.data.metadataCID);
      setConfirmedSelection(true);
      handleUpdateStateCollectibles(data.data.userHasCollectible);
    },
    onError: (error: Error) => {
      console.error("Error uploading to pinata:", error);
      setConfirmedSelection(false);
    },
  });
};
