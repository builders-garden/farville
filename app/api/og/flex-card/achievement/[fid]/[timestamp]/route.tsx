import { getPlayerCount } from "@/lib/prisma/queries";
import { getGlobalLeaderboard } from "@/lib/utils";
import { getUser } from "@/supabase/queries";
import { DbUser } from "@/supabase/types";
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
    const crop = searchParams.get("crop");
    const step = searchParams.get("step");

    const appUrl = process.env.NEXT_PUBLIC_URL;

    if (!fid) {
      return new Response("Farmer ID is required", {
        status: 400,
      });
    }

    const user = await getUser(Number(fid));
    const playerCount = await getPlayerCount();

    const leaderboardData = (await getGlobalLeaderboard(
      fid,
      "xp",
      5
    )) as LeaderboardData;

    const topLeaderboardUsers: DbUser[] = [];
    for (const leaderboardUser of leaderboardData.users) {
      const user = await getUser(leaderboardUser.fid);
      if (user) {
        topLeaderboardUsers.push(user);
      }
    }

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

    const badgeImage = await fetch(
      new URL(`${appUrl}/images/badge/${crop}-${step}.png`, import.meta.url)
    );
    const badgeImageBuffer = await badgeImage.arrayBuffer();

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;

    const username = user?.username || "Farmer";

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
              background:
                "linear-gradient(135deg, #8B5A38 0%, #5D3A1F 50%, #4E2E16 100%)",
              borderRadius: "16px",
              border: "3px solid #6D4626",
              overflow: "hidden",
              boxShadow:
                "0 8px 20px rgba(0, 0, 0, 0.6), 0 0 12px rgba(255, 215, 0, 0.3)",
              position: "relative",
              flexDirection: "column",
              padding: "12px",
              justifyContent: "space-between",
            }}
          >
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
                  width: "300px",
                }}
              >
                {/* Badge text */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "18px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#ffffff",
                      textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    I got a new badge!
                  </span>
                  <span
                    style={{
                      fontSize: "32px",
                      color: "#FFD700",
                      textShadow: "0px 3px 10px rgba(255, 215, 0, 0.6)",
                      position: "relative",
                    }}
                  >
                    {"Bugs Bunny"}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#ffffff",
                      textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                      marginTop: "-3px", // adjust due to font
                    }}
                  >
                    on FarVille!
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
                        streakUser.avatarUrl && (
                          <img
                            key={index}
                            src={streakUser.avatarUrl}
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
                    +{playerCount}{" "}
                    <span style={{ marginLeft: "5px" }}> active farmers</span>
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
                {/* Gold aura around badge picture */}
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
                {/* Badge image in center */}
                <div
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "16%",
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
                  {
                    <img
                      src={`data:image/png;base64,${Buffer.from(
                        badgeImageBuffer
                      ).toString("base64")}`}
                      width="100%"
                      height="100%"
                      style={{
                        objectFit: "contain",
                        filter: "drop-shadow(0 0 3px rgba(255,215,0,0.5))",
                      }}
                    />
                  }
                </div>
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
