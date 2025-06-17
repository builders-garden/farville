import { useApiQuery } from "./use-api-query";

export interface ClanLeaderboardEntry {
  id: string;
  name: string;
  imageUrl: string | null;
  xp: number;
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

export const useClansLeaderboard = (
  limit = 50,
  options?: {
    includeMembers?: boolean;
    includeLeader?: boolean;
  }
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("limit", limit.toString());
  if (options?.includeMembers) queryParams.append("includeMembers", "true");
  if (options?.includeLeader) queryParams.append("includeLeader", "true");

  const url = `/api/leaderboard/clans?${queryParams.toString()}`;

  return useApiQuery<ClanLeaderboardEntry[]>({
    url,
    queryKey: [
      "clans-leaderboard",
      limit,
      options?.includeMembers,
      options?.includeLeader,
    ],
    isProtected: true,
    staleTime: 60 * 1000, // 1 minute
  });
};
