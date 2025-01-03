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

export type DbReferrals = {
  fid: number;
  referredFid: number;
  createdAt: string;
};

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
}

// Helper type for inserting new grid cells
export type InsertDbGridCell = Omit<DbGridCell, "createdAt">;
