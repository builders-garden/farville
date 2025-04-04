import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";

export const usePinata = ({
  setMetadataCID,
}: {
  setMetadataCID: Dispatch<SetStateAction<string | null>>;
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
      console.log("usePinata onSuccess", data);
      setMetadataCID(data.metadataCID);
    },
  });
};
