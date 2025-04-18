import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { Mode } from "fs";

export interface DbItem {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  buyPrice: number | null;
  sellPrice: number | null;
  requiredLevel: number;
  slug: string;
  createdAt: Date;
}

export interface UserWithStatistic {
  fid: number;
  mode: Mode;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  walletAddress: string;
  xp: number;
  coins: number;
  expansions: number;
  notificationDetails: FrameNotificationDetails | null;
  createdAt: Date;
  mintedOG: boolean;
  selectedAvatarUrl: string | null;
}

export interface UserWithStatistics {
  fid: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  walletAddress: string | null;
  notificationDetails: FrameNotificationDetails | null;
  createdAt: Date;
  mintedOG: boolean;
  selectedAvatarUrl: string | null;
  statistics: {
    mode: Mode;
    xp: number;
    coins: number;
    expansions: number;
    createdAt: Date;
  }[];
}

export interface DbUserDonation {
  lastDonation: Date;
  donatorFid: number;
  receiverFid: number;
  times: number | null;
}

export interface DbUserHasItem {
  userFid: number;
  itemId: number;
  quantity: number;
  createdAt: Date;
}
