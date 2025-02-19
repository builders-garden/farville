export interface DbItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  requiredLevel: number;
  slug: string;
  createdAt: string;
}

export interface DbUser {
  fid: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  walletAddress: string | null;
  xp: number;
  coins: number;
  expansions: number;
  notificationDetails: string | null;
  createdAt: string;
}

export interface DbUserHasItem {
  id: number;
  userFid: number;
  itemId: number;
  quantity: number;
  createdAt: string;
}

export interface DbReferrals {
  id: number;
  fid: number;
  referredFid: number;
  createdAt: string;
}

// Helper type for inserting new records
export type InsertDbItem = Omit<DbItem, "id" | "createdAt">;
export type InsertDbUser = Omit<DbUser, "createdAt">;
export type InsertDbUserHasItem = Omit<DbUserHasItem, "id" | "createdAt">;

export interface DbGridCell {
  fid: number;
  x: number;
  y: number;
  cropType: string | null;
  plantedAt: string | null;
  isReadyToHarvest: boolean;
  createdAt: string;
  harvestAt: string | null;
  speedBoostedAt: string | null;
  yieldBoost: number | null;
}

// Helper type for inserting new grid cells
export type InsertDbGridCell = Omit<DbGridCell, "createdAt">;

export interface DbUserNotification {
  id: string;
  fid: number;
  category: string;
  createdAt: string;
}

// Helper type for inserting new notifications
export type InsertDbUserNotification = Omit<
  DbUserNotification,
  "createdAt" | "id"
>;

export interface DbRequest {
  id: number;
  fid: number;
  itemId: number;
  quantity: number;
  filledQuantity: number;
  createdAt: string;
}

export type InsertDbRequest = Omit<
  DbRequest,
  "id" | "createdAt" | "filledQuantity"
>;

export interface DbQuest {
  id: number;
  category: string;
  type: "daily" | "weekly" | "monthly" | null;
  itemId: number | null;
  amount: number | null;
  xp: number | null;
  coins: number | null;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  level: number | null;
}

// Helper type for inserting new quests
export type InsertDbQuest = Omit<DbQuest, "id" | "createdAt">;

export type DbQuestWithItem = DbQuest & { items: DbItem | null };

export type DbUserHasQuestStatus = "incomplete" | "completed" | "claimed";

export interface DbUserHasQuest {
  id: number;
  fid: number;
  questId: number;
  status: DbUserHasQuestStatus;
  completedAt: string | null;
  createdAt: string;
  progress: number;
}

export type DbUserHasQuestWithQuest = DbUserHasQuest & {
  quest: DbQuestWithItem;
};

// Helper type for inserting new user quests
export type InsertDbUserHasQuest = Omit<DbUserHasQuest, "id" | "createdAt">;

export type DbUserDonation = {
  donatorFid: number;
  receiverFid: number;
  times: number;
  lastDonation: string;
};

export type DbStreak = {
  id: number;
  fid: number;
  startedAt: Date;
  endedAt: Date | null;
  lastActionAt: Date;
};

export type DbUserFrost = {
  id: number;
  streakId: number;
  frozenAt: Date;
};
