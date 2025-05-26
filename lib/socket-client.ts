import { UserCommunityDonation } from "@prisma/client";
import { io, Socket } from "socket.io-client";
import { env } from "@/lib/env";

export type ServerToClientEvents = {
  "new-donation": (data: {
    message: string | null;
    id: string;
    txHash: string;
    mode: string;
    fid: number;
    dollarAmount: number;
    ptAmount: number;
    createdAt: Date;
    walletAddress: string;
    username: string;
    stage: number;
    combo: number;
    pfp: string;
  }) => void;
  "harvest-all": (data: {
    newStage: number;
    currentPoints: number;
    lastDonation: UserCommunityDonation;
    combo: number;
  }) => void;
  "new-decrement": (data: { stage: number; combo: number }) => void;
};

export type ClientToServerEvents = {
  "new-donation": (data: {
    fid: number;
    mode: string;
    username: string;
    ptAmount: number;
  }) => void;
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

// this function creates a socket connection or returns the existing one
export const getSocket = () => {
  if (!socket) {
    socket = io(env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });
  }
  return socket;
};
