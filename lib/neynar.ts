export interface NeynarUser {
  fid: string;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
    primary: {
      eth_address: string | null;
      sol_address: string | null;
    };
  };
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
  limit: number = 300,
  sortType: "algorithmic" | "desc_chron" = "algorithmic"
): Promise<NeynarUser[]> => {
  const allUsers: NeynarUser[] = [];
  let cursor = null;

  while (allUsers.length < limit) {
    const response: Response = await fetch(
      `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100${
        cursor ? `&cursor=${cursor}` : ""
      }&sort_type=${sortType}`,
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
      break;
    }

    allUsers.push(
      ...data.users.map((o: { object: "follow"; user: NeynarUser }) => o.user)
    );

    if (!data.next) {
      break;
    }
    cursor = data.next.cursor;
  }

  return allUsers.slice(0, limit);
};
