import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";

export const usePinata = ({
  setMetadataCID,
  setConfirmedSelection,
}: {
  setMetadataCID: Dispatch<SetStateAction<string | null>>;
  setConfirmedSelection: Dispatch<SetStateAction<boolean>>;
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
    }) => {
      setMetadataCID(data.metadataCID);
      setConfirmedSelection(true);
    },
  });
};
