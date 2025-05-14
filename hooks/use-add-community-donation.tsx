import { useApiMutation } from "./use-api-mutation";
import { Mode } from "@/lib/types/game";
import { useSocket } from "./use-socket";

interface AddCommunityDonationParams {
  txHash: string;
  mode: Mode;
  fid: number;
  ptAmount: number;
  dollarAmount: number;
  walletAddress: string;
  username: string;
}

export const useAddCommunityDonation = () => {
  const { socket } = useSocket();

  return useApiMutation<unknown, AddCommunityDonationParams>({
    url: "/api/user-community-donation",
    method: "POST",
    body: (data: AddCommunityDonationParams) => ({
      txHash: data.txHash,
      mode: data.mode,
      fid: data.fid,
      ptAmount: data.ptAmount,
      dollarAmount: data.dollarAmount,
      walletAddress: data.walletAddress,
    }),
    mutationKey: ["add-community-donation"],
    isProtected: true,
    onSuccess: (_, variables) => {
      if (socket?.connected) {
        socket.emit("new-donation", {
          fid: variables.fid,
          mode: variables.mode,
          username: variables.username,
          // TODO: ptAmount should be returned from the api POST
          ptAmount: variables.ptAmount,
        });
      } else {
        console.error("Socket is not connected");
      }
    },
  });
};
