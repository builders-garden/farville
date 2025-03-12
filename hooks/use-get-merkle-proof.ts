import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";

export const useGetMerkleProof = ({
  setMerkleProof,
}: {
  setMerkleProof: Dispatch<SetStateAction<`0x${string}`[] | null>>;
}) => {
  return useApiMutation({
    url: () => `/api/og-nft-proof`,
    body: ({ address, nftId }: { address: `0x${string}`; nftId: number }) => ({
      address,
      nftId,
    }),
    method: "POST",
    onSuccess: (data: { proof: `0x${string}`[] }) => {
      setMerkleProof(data.proof);
    },
  });
};
