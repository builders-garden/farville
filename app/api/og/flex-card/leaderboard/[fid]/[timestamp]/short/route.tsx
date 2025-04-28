import { env } from "@/lib/env";
import { getActiveStreaksCount, getUserByMode } from "@/lib/prisma/queries";
import { UserWithStatistic } from "@/lib/prisma/types";
import { Mode } from "@/lib/types/game";
import { getGlobalLeaderboard } from "@/lib/utils";
import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";
const size = {
  width: 600,
  height: 400,
};

interface LeaderboardData {
  users: {
    questCount: number;
    fid: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  }[];
  targetPosition: number;
  questCount: number | undefined;
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
    // const friends = searchParams.get("friends") === "true";
    const quests = searchParams.get("quests") === "true";
    const mode = (searchParams.get("mode") as Mode) || Mode.Classic;

    const appUrl = env.NEXT_PUBLIC_URL;

    if (!fid) {
      return new Response("Farmer ID is required", {
        status: 400,
      });
    }

    const user = await getUserByMode(Number(fid), mode);
    const totActivePlayers = await getActiveStreaksCount();

    const leaderboardData = (await getGlobalLeaderboard(
      fid,
      mode,
      quests ? "quests" : "xp",
      5
    )) as LeaderboardData;

    const topLeaderboardUsers: UserWithStatistic[] = [];
    for (const leaderboardUser of leaderboardData.users) {
      const user = await getUserByMode(leaderboardUser.fid, mode);
      if (user) {
        topLeaderboardUsers.push(user);
      }
    }

    const userPosition = leaderboardData.targetPosition;

    const bgImageRes = await fetch(
      new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)
    );
    const bgImage = await bgImageRes.arrayBuffer();

    const calendarRes = await fetch(
      new URL(`${appUrl}/images/flex-cards/calendar.svg`, import.meta.url)
    );
    const calendarSvg = await calendarRes.text();
    const farmerRes = await fetch(
      new URL(`${appUrl}/images/flex-cards/farmer.svg`, import.meta.url)
    );
    const farmerSvg = await farmerRes.text();

    const trophyIconRes = await fetch(
      new URL(`${appUrl}/images/special/trophy.png`, import.meta.url)
    );
    const trophyIcon = await trophyIconRes.arrayBuffer();

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;

    const username = user?.username || "Farmer";

    const getNumberSuffix = (n: number) => {
      const lastDigit = n % 10;
      const lastTwoDigits = n % 100;
      if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return "th";
      switch (lastDigit) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
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

          {/* Main Card Container - Matches the game's UI style */}
          <div
            style={{
              display: "flex",
              width: "90%",
              height: "80%",
              background: "rgba(44, 25, 15, 0.6)",
              backdropFilter: "blur(16px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(44, 25, 15, 0.6)",
              position: "relative",
              flexDirection: "column",
              padding: "12px",
              justifyContent: "space-between",
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
            {/* Card Header */}
            <div
              style={{
                fontSize: "14px",
                color: "#ffffff",
                fontFamily: "PressStart2P",
                textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {/* User */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "7.5px 10px",
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.2))",
                  borderRadius: "12px",
                }}
              >
                <img
                  src={`data:image/svg+xml;base64,${Buffer.from(
                    farmerSvg
                  ).toString("base64")}`}
                  width="25px"
                  height="25px"
                />
                {username}
              </div>
              {/* Date */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.2))",
                  padding: "7.5px 10px",
                  borderRadius: "12px",
                }}
              >
                <img
                  src={`data:image/svg+xml;base64,${Buffer.from(
                    calendarSvg
                  ).toString("base64")}`}
                  width="25px"
                  height="25px"
                />
                <p
                  style={{
                    color: "#ffffff",
                    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
                    fontFamily: "PressStart2P",
                    margin: 0,
                  }}
                >
                  {formattedDate}
                </p>
              </div>
            </div>
            {/* Streak Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                background:
                  "linear-gradient(145deg, rgba(43, 27, 16, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%)",
                borderRadius: "10px",
                padding: "8px",
                width: "100%",
                boxShadow:
                  "inset 0 0 10px rgba(0, 0, 0, 0.3), 0 0 5px rgba(255, 215, 0, 0.15)",
              }}
            >
              {/* Left Part */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px",
                  fontFamily: "PressStart2P",
                  alignItems: "flex-start",
                  gap: "22px",
                }}
              >
                {/* Leaderboard Pills */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                    fontSize: "8px",
                    marginBottom: "4px",
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
                      backgroundColor: "#8B5A38",
                      borderRadius: "9999px",
                      padding: "4px 12px",
                    }}
                  >
                    {"Global"}
                  </div>
                </div>
                {/* Leaderboard position text */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#ffffff",
                      textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    I&apos;m
                  </span>
                  <span
                    style={{
                      fontSize: "40px",
                      color: "#FFD700",
                      textShadow: "0px 3px 10px rgba(255, 215, 0, 0.6)",
                      position: "relative",
                    }}
                  >
                    {userPosition}{" "}
                    <sup
                      style={{
                        fontSize: "24px",
                        color: "#FFD700",
                        textShadow: "0px 3px 10px rgba(255, 215, 0, 0.6)",
                      }}
                    >
                      {getNumberSuffix(userPosition)}
                    </sup>
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#ffffff",
                      textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                      marginTop: "-3px", // adjust due to font
                    }}
                  >
                    on Farville!
                  </span>
                </div>
                {/* Top Leaderboard Users */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    {topLeaderboardUsers.slice(0, 5).map(
                      (streakUser, index) =>
                        (streakUser.selectedAvatarUrl ||
                          streakUser.avatarUrl) && (
                          <img
                            key={index}
                            src={
                              streakUser.selectedAvatarUrl ||
                              streakUser.avatarUrl ||
                              ""
                            }
                            width="30px"
                            height="30px"
                            style={{
                              objectFit: "cover",
                              border: "1px solid #322214",
                              borderRadius: "100%",
                              marginLeft: index > 0 ? "-12px" : "0", // Create overlapping effect with more overlap
                              boxShadow: "0 0 3px rgba(0, 0, 0, 0.5)",
                              zIndex: 5 - index, // Higher z-index for elements that should appear on top
                            }}
                          />
                        )
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#ffffff",
                    }}
                  >
                    +{totActivePlayers}{" "}
                    <span style={{ marginLeft: "5px" }}>active farmers</span>
                  </span>
                </div>
              </div>

              {/* Right Section - Profile with fire icons */}
              <div
                style={{
                  flex: "1.2",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  marginLeft: "20px",
                }}
              >
                {/* Gold aura around profile picture */}
                <div
                  style={{
                    position: "absolute",
                    width: "165px",
                    height: "165px",
                    borderRadius: "100%",
                    background:
                      "radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)",
                    zIndex: 0,
                  }}
                />
                {/* Profile picture in center */}
                <div
                  style={{
                    width: "145px",
                    height: "145px",
                    borderRadius: "100%",
                    overflow: "hidden",
                    background:
                      "linear-gradient(135deg, #6B4D23 0%, #4A3419 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.7), 0 0 25px rgba(255,215,0,0.6), 0 0 10px #FFD700",
                  }}
                >
                  {(user?.selectedAvatarUrl || user?.avatarUrl) && (
                    <img
                      src={user?.selectedAvatarUrl || user?.avatarUrl || ""}
                      width="100%"
                      height="100%"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                {/* Small trophy icons around profile picture */}
                {[
                  // Top Right
                  {
                    top: "5px",
                    left: "60%",
                    marginLeft: "-15px",
                    rotation: "20deg",
                    size: "45px",
                  },
                  // Bottom right
                  {
                    top: "60%",
                    marginTop: "-20px",
                    right: "20px",
                    rotation: "10deg",
                    size: "70px",
                  },
                  // Bottom left
                  {
                    bottom: "15px",
                    left: "40%",
                    marginLeft: "-30px",
                    rotation: "-5deg",
                    size: "30px",
                  },
                  // Top left
                  {
                    top: "40%",
                    marginTop: "-55px",
                    left: "30px",
                    rotation: "-10deg",
                    size: "55px",
                  },
                ].map((position, index) => (
                  <img
                    key={index}
                    src={`data:image/png;base64,${Buffer.from(
                      trophyIcon
                    ).toString("base64")}`}
                    width={position.size}
                    height={position.size}
                    style={{
                      position: "absolute",
                      objectFit: "contain",
                      transform: `rotate(${position.rotation})`,
                      filter: "drop-shadow(0 0 3px rgba(255,215,0,0.5))",
                      ...position,
                      zIndex: 2,
                    }}
                  />
                ))}
              </div>
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
    console.log(`Failed to generate streak image`, e);
    return new Response(`Failed to generate streak image`, {
      status: 500,
    });
  }
}
