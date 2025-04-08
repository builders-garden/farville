import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";

export const useGetBackendSignature = ({
  setBackendSignature,
  setIsLoading,
}: {
  setBackendSignature: Dispatch<SetStateAction<`0x${string}` | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  return useApiMutation({
    url: () => `/api/pfp-nft-signature`,
    body: ({
      address,
      nftId,
      tokenURI,
    }: {
      address: `0x${string}`;
      nftId: number;
      tokenURI: string;
    }) => ({
      recipient: address,
      tokenId: nftId,
      tokenIdURI: tokenURI,
    }),
    method: "POST",
    onSuccess: (data: {
      success: boolean;
      data: {
        signature: `0x${string}`;
        signerAddress: `0x${string}`;
      };
    }) => {
      setBackendSignature(data.data.signature);
      setIsLoading(false);
    },
    onError: (error: Error) => {
      console.error("Error getting backend signature:", error);
      setIsLoading(false);
    },
  });
};
