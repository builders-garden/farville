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
  createdAt: Date;
  mintedOG: boolean;
  selectedAvatarUrl: string | null;
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
