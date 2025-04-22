import {
  getCurrentLevelAndProgress,
  getPartialLeaderboardBasedOnFid,
} from "@/lib/utils";
import { ImageResponse } from "next/og";
import { getActiveStreaksCount } from "@/lib/prisma/queries";
import { env } from "@/lib/env";
import { UserWithStatistic } from "@/lib/prisma/types";

export const dynamic = "force-dynamic";
const size = {
  width: 600,
  height: 400,
};

interface PartialLeaderboard extends UserWithStatistic {
  questCount?: number;
  position: number;
}

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
    const quests = searchParams.get("quests") === "true";

    const appUrl = env.NEXT_PUBLIC_URL;

    if (!fid) {
      return new Response("Farmer ID, scope and type are required", {
        status: 400,
      });
    }

    const totActiveStreaks = await getActiveStreaksCount();

    const leaderboardData = (await getPartialLeaderboardBasedOnFid(fid, {
      friends,
      type: quests ? "quests" : "xp",
      limit: 5,
    })) as PartialLeaderboard[];

    // Load background image
    const bgImageRes = await fetch(
      new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)
    );
    const bgImage = await bgImageRes.arrayBuffer();

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
              background: "rgba(44, 25, 15, 0.6)",
              backdropFilter: "blur(16px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(44, 25, 15, 0.6)",
              position: "relative",
              flexDirection: "column",
              padding: "16px",
              justifyContent: "space-between",
              gap: "8px",
              color: "white",
            }}
          >
            {/* Additional inner shadow for better text contrast */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(180deg, rgba(44, 25, 15, 0.2) 0%, rgba(44, 25, 15, 0.3) 100%)",
                pointerEvents: "none",
              }}
            />
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
                  {quests ? "Quests" : "Experience"}
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
              {leaderboardData.map((entry) => {
                const isCurrentUser = entry.fid === Number(fid);

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
                        #{entry.position}
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
                        {entry.selectedAvatarUrl || entry.avatarUrl ? (
                          <img
                            src={
                              entry.selectedAvatarUrl || entry.avatarUrl || ""
                            }
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
                      {!quests ? (
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
