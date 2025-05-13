import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import {
  Collectible,
  Quest,
  UserHasCollectible,
  UserHasQuest,
  Item,
  UserHasVoucher,
  Voucher,
} from "@prisma/client";
import { Mode } from "../types/game";

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

export type QuestWithItem = Quest & { item: Item | null };

export type UserHasQuestWithQuest = UserHasQuest & {
  quest: QuestWithItem;
};

export type UserCompleteCollectible = Collectible & {
  userHasCollectibles: UserHasCollectible | null;
};

export type VoucherWithItem = Voucher & {
  item: Item | null;
};

export type UserHasVoucherWithVoucher = UserHasVoucher & {
  voucher: VoucherWithItem;
};
