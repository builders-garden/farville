export interface NeynarUser {
  fid: string;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verifications: string[];
}

export const fetchUser = async (fid: string): Promise<NeynarUser> => {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        "x-api-key": process.env.NEYNAR_API_KEY!,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Farcaster user on Neynar");
  }
  const data = await response.json();
  return data.users[0];
};

export const fetchUsersFollowedBy = async (
  fid: string,
  limit: number = 100
): Promise<NeynarUser[]> => {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=${limit}&sort_type=algorithmic`,
    {
      headers: {
        "x-api-key": process.env.NEYNAR_API_KEY!,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch followed users from Neynar");
  }

  const data = await response.json();
  if (data.users.length === 0) {
    return [];
  }
  return data.users.map((o: {object: "follow", user: NeynarUser}) => o.user);
};
