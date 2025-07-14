import { useApiQuery } from "./use-api-query";

export interface ClanLeaderboardEntry {
  id: string;
  name: string;
  imageUrl: string | null;
  xp: number;
  seasonXp: number;
  lastSeasonXp: number;
  isPublic: boolean;
  requiredLevel: number | null;
  maxMembers: number;
  motto: string; // Required field in schema
  createdBy: number;
  leaderFid: number; // Required field in schema
  txHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  members?: {
    fid: number;
    role: string;
    joinedAt: string;
    xpContributed: number;
    user: {
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      selectedAvatarUrl: string | null;
      mintedOG: boolean;
    };
  }[];
  leader?: {
    fid: number;
    username: string;
  };
}

export interface ClanLeaderboardResponse {
  clans: ClanLeaderboardEntry[];
  userClan?: ClanLeaderboardEntry & {
    rank: number;
  };
}

export const useClansLeaderboard = (
  limit = 50,
  options?: {
    includeMembers?: boolean;
    includeLeader?: boolean;
    userClanId?: string;
    type: "season" | "lastSeason" | "global";
  }
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("limit", limit.toString());
  if (options?.includeMembers) queryParams.append("includeMembers", "true");
  if (options?.includeLeader) queryParams.append("includeLeader", "true");
  if (options?.userClanId) queryParams.append("userClanId", options.userClanId);
  queryParams.append("type", options?.type || "season");

  const url = `/api/leaderboard/clans?${queryParams.toString()}`;

  return useApiQuery<ClanLeaderboardResponse>({
    url,
    queryKey: [
      "clans-leaderboard",
      limit,
      options?.includeMembers,
      options?.includeLeader,
      options?.userClanId,
      options?.type || "season",
    ],
    isProtected: true,
    staleTime: 60 * 1000, // 1 minute
  });
};
