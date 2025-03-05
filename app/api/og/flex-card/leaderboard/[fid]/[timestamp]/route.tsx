import { LeaderboardResponse } from "@/hooks/use-leadeboard";
import { getUser } from "@/supabase/queries";
import { getCurrentLevelAndProgress } from "@/lib/utils";
import { ImageResponse } from "next/og";
import { getActiveStreaksCount } from "@/lib/prisma/queries";

export const dynamic = "force-dynamic";
const size = {
  width: 600,
  height: 400,
};

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      fid: string;
      timestamp: string;
    }>;
  }
) {
  try {
    const { fid } = await params;
    const { searchParams } = new URL(request.url);
    const friends = searchParams.get("friends") === "true";
    const type = searchParams.get("type") || "xp";

    const appUrl = process.env.NEXT_PUBLIC_URL;

    if (!fid) {
      return new Response("Farmer ID, scope and type are required", {
        status: 400,
      });
    }

    const user = await getUser(Number(fid));
    const totActiveStreaks = await getActiveStreaksCount();

    // Build query parameters for leaderboard request
    const leaderboardQueryParams = new URLSearchParams();
    leaderboardQueryParams.append("targetFid", fid);
    if (friends) leaderboardQueryParams.append("friends", "true");
    if (type === "quests") leaderboardQueryParams.append("type", "quests");

    // Make the API request to the leaderboard endpoint with a special header
    const leaderboardRes = await fetch(
      new URL(
        `${appUrl}/api/leaderboard?${leaderboardQueryParams.toString()}`,
        import.meta.url
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Next.js OG Image Generator",
        },
      }
    );

    if (!leaderboardRes.ok) {
      throw new Error("Failed to fetch leaderboard data");
    }

    const leaderboardData =
      (await leaderboardRes.json()) as LeaderboardResponse;

    // Load background image
    const bgImageRes = await fetch(
      new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)
    );
    const bgImage = await bgImageRes.arrayBuffer();

    // Load user profile picture if available
    let profilePic = null;
    if (user?.avatarUrl) {
      try {
        const profilePicRes = await fetch(user.avatarUrl);
        if (profilePicRes.ok) {
          profilePic = await profilePicRes.arrayBuffer();
        }
      } catch (e) {
        console.error("Failed to load profile picture", e);
      }
    }

    // Format XP to shorter version (e.g., 110,000 -> 110k)
    const formatXP = (xp: number): string => {
      if (xp >= 1000000) {
        return `${(xp / 1000000).toFixed(1)}M XP`;
      } else if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1)}k XP`;
      } else {
        return `${xp} XP`;
      }
    };

    // Find target user and determine which users to display
    const targetFid = Number(fid);
    const allUsers = leaderboardData.users || [];
    const targetPosition = leaderboardData.targetPosition || 0;
    let displayUsers = [];

    const targetIndex = allUsers.findIndex((u) => u.fid === targetFid);

    if (targetIndex === -1) {
      // User not in the list - show user on top and top 4 users
      if (user) {
        // Create user entry with data from targetPosition and questCount
        const userEntry = {
          ...user,
          questCount:
            type === "quests" ? leaderboardData.questCount || 0 : undefined,
        };

        // Add user at the top, then up to 4 top users from leaderboard
        displayUsers = [userEntry, ...allUsers.slice(0, 4)];
      } else {
        // If no user data, just show top 5 users
        displayUsers = allUsers.slice(0, 5);
      }
    } else {
      // User is in the list - show 5 users with target user included
      // Calculate the ideal starting position to keep target user roughly in the middle
      const idealStart = Math.max(0, targetIndex - 2);
      const availableUsersAfter = allUsers.length - (idealStart + 1);
      const displayCount = Math.min(5, allUsers.length);

      // If we don't have enough users after the target, adjust the start position
      const finalStart =
        availableUsersAfter < displayCount - 1
          ? Math.max(0, allUsers.length - displayCount)
          : idealStart;

      displayUsers = allUsers.slice(finalStart, finalStart + displayCount);
    }

    // Fetch profile pictures for all users in displayUsers
    const userProfilePics: (ArrayBuffer | null)[] = [];
    for (const entry of displayUsers) {
      let profilePic = null;
      if (entry?.avatarUrl) {
        try {
          const profilePicRes = await fetch(entry.avatarUrl);
          if (profilePicRes.ok) {
            profilePic = await profilePicRes.arrayBuffer();
          }
        } catch (e) {
          console.error(
            `Failed to load profile picture for user ${entry.fid}`,
            e
          );
        }
      }
      userProfilePics.push(profilePic);
    }

    const fontData = await loadGoogleFont(
      "Press+Start+2P",
      // put here all the text that it's potentially going to be displayed
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,.<>/?"
    );

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            backgroundImage: `url(data:image/png;base64,${Buffer.from(
              bgImage
            ).toString("base64")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.6)",
            }}
          />

          {/* Main Card Container */}
          <div
            style={{
              display: "flex",
              width: "90%",
              height: "85%",
              background:
                "linear-gradient(135deg, #8B5A38 0%, #5D3A1F 50%, #4E2E16 100%)",
              borderRadius: "16px",
              border: "3px solid #6D4626",
              overflow: "hidden",
              boxShadow:
                "0 8px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 215, 0, 0.3)",
              position: "relative",
              flexDirection: "column",
              padding: "16px",
              justifyContent: "space-between",
              gap: "8px",
              color: "white",
            }}
          >
            {/* Header Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      marginRight: "10px",
                    }}
                  >
                    🏆
                  </span>
                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      margin: 0,
                      color: "#FFD700",
                      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      fontFamily: "PressStart2P",
                    }}
                  >
                    LEADERBOARD
                  </h1>
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    color: "#ffffff",
                  }}
                >
                  +{totActiveStreaks}{" "}
                  <span style={{ marginLeft: "5px" }}>farmers are playing</span>
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "4px",
                  fontSize: "8px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#FFB938",
                    color: "#5c4121",
                    borderRadius: "9999px",
                    padding: "4px 12px",
                    fontWeight: "bold",
                  }}
                >
                  {type === "xp" ? "Experience" : "Quests"}
                </div>
                <div
                  style={{
                    backgroundColor: "#6D4C2C",
                    borderRadius: "9999px",
                    padding: "4px 12px",
                  }}
                >
                  {friends ? "Friends" : "Global"}
                </div>
              </div>
            </div>

            {/* Leaderboard entries */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                width: "100%",
              }}
            >
              {displayUsers.map((entry, index) => {
                const isCurrentUser = entry.fid === Number(fid);

                // Calculate the correct rank for each user
                let rank;
                if (targetIndex === -1 && index === 0) {
                  // If user is not in the list but added manually (first position in displayUsers)
                  rank = targetPosition;
                } else if (targetIndex === -1) {
                  // For other users when target user is not in the original list
                  rank = index; // Index in the original list (0-indexed, so position is index + 1)
                } else {
                  // When target user is in the original list
                  const positionInOriginalList = allUsers.findIndex(
                    (u) => u.fid === entry.fid
                  );
                  rank = positionInOriginalList + 1; // +1 because positions are 1-indexed
                }

                const level = getCurrentLevelAndProgress(entry.xp).currentLevel;

                return (
                  <div
                    key={entry.fid}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: isCurrentUser
                        ? "#8B5E3C"
                        : "rgba(109, 76, 44, 0.8)",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: isCurrentUser
                        ? "2px solid #FFB938"
                        : "1px solid rgba(139, 94, 60, 0.5)",
                      height: "43px",
                    }}
                  >
                    {/* Left section: Rank + Avatar + Username */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {/* Rank */}
                      <span
                        style={{
                          backgroundColor: "#5C4121",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          textAlign: "center",
                          minWidth: "24px",
                        }}
                      >
                        #{rank}
                      </span>

                      {/* Avatar with profile picture */}
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "9999px",
                          backgroundColor: "#5C4121",
                          border: "2px solid #FFB938",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {userProfilePics[index] ? (
                          <img
                            src={`data:image/png;base64,${Buffer.from(
                              userProfilePics[index]!
                            ).toString("base64")}`}
                            width="100%"
                            height="100%"
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              height: "100%",
                              fontSize: "20px",
                              color: "#FFB938",
                            }}
                          >
                            🧑‍🌾
                          </span>
                        )}
                      </div>

                      {/* Username */}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "180px",
                        }}
                      >
                        {entry.username}
                      </span>
                    </div>

                    {/* Right section: Level and XP/Quests */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        fontSize: "12px",
                        height: "100%",
                      }}
                    >
                      {type === "xp" ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                          }}
                        >
                          <div
                            style={{
                              color: "#FFB938",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            Lvl {level}
                          </div>
                          <div
                            style={{
                              color: "rgba(255, 255, 255, 0.9)",
                              display: "flex",
                              alignItems: "center",
                              minWidth: "65px",
                              justifyContent: "flex-start",
                            }}
                          >
                            {formatXP(entry.xp)}
                          </div>
                        </div>
                      ) : (
                        <span>{entry?.questCount || 0} Quests</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: "PressStart2P",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    console.log(`Failed to generate leaderboard image`, e);
    return new Response(`Failed to generate leaderboard image: ${e}`, {
      status: 500,
    });
  }
}
