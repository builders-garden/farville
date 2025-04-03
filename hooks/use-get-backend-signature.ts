import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";

export const useGetBackendSignature = ({
  setBackendSignature,
}: {
  setBackendSignature: Dispatch<SetStateAction<`0x${string}`[] | null>>;
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
    onSuccess: (data: { proof: `0x${string}`[] }) => {
      setBackendSignature(data.proof);
    },
  });
};
