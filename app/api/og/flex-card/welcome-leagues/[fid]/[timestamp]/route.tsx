import { env } from "@/lib/env";
import {
  getActiveStreaksCount,
  getTopStreaks,
  TopStreaksResult,
} from "@/lib/prisma/queries";
import { getUserLeague } from "@/lib/utils";
import { getUser } from "@/supabase/queries";
import { DbUser } from "@/supabase/types";
import { ImageResponse } from "next/og";

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
  _request: Request,
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

    const appUrl = env.NEXT_PUBLIC_URL;

    if (!fid) {
      return new Response("Farmer ID is required", {
        status: 400,
      });
    }

    const user = await getUser(Number(fid));

    if (!user) {
      return new Response("User not found", {
        status: 404,
      });
    }

    const topStreaks: TopStreaksResult[] = await getTopStreaks();
    const totActiveStreaks = await getActiveStreaksCount();

    const topStreaksUsers: DbUser[] = [];
    for (const streak of topStreaks) {
      const user = await getUser(streak.fid);
      if (user) {
        topStreaksUsers.push(user);
      }
    }

    // retrieve user league based on his experience
    const userLeague = getUserLeague(user.xp);

    if (userLeague === 0) {
      return new Response("User is not ready for the league", {
        status: 404,
      });
    }

    const bgImageRes = await fetch(
      new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)
    );
    const bgImage = await bgImageRes.arrayBuffer();

    const leagueIconRes = await fetch(
      new URL(`${appUrl}/images/leagues/${userLeague}.png`, import.meta.url)
    );
    const leagueIcon = await leagueIconRes.arrayBuffer();

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
              height: "90%",
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
            }}
          >
            {/* Streak Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background:
                  "linear-gradient(145deg, rgba(43, 27, 16, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%)",
                borderRadius: "10px",
                padding: "16px",
                width: "100%",
                height: "100%",
                boxShadow:
                  "inset 0 0 10px rgba(0, 0, 0, 0.3), 0 0 5px rgba(255, 215, 0, 0.15)",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              {/* User pfp section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  marginTop: "10px",
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
                {/* Profile picture */}
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
                {/* Trophy icons */}
                {[
                  // Top Right
                  {
                    top: "2px",
                    left: "60%",
                    marginLeft: "8px",
                    rotation: "20deg",
                    size: "50px",
                  },
                  // Bottom right
                  {
                    top: "60%",
                    marginTop: "2px",
                    right: "-20px",
                    rotation: "10deg",
                    size: "60px",
                  },
                  // Bottom left
                  {
                    bottom: "15px",
                    left: "40%",
                    marginLeft: "-70px",
                    rotation: "-14deg",
                    size: "40px",
                  },
                  // Top left
                  {
                    top: "40%",
                    marginTop: "-55px",
                    left: "-5px",
                    rotation: "-10deg",
                    size: "55px",
                  },
                ].map((position, index) => (
                  <img
                    key={index}
                    src={`data:image/png;base64,${Buffer.from(
                      leagueIcon
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

              {/* Text content */}

              {/* League text */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  fontFamily: "PressStart2P",
                  width: "100%",
                  fontSize: "14px",
                  color: "#ffffff",
                  textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                  gap: "16px",
                }}
              >
                <span
                  style={{
                    lineHeight: "1.5",
                  }}
                >
                  Planting seeds of victory in the
                </span>
                <span
                  style={{
                    fontSize: "25px",
                    color:
                      userLeague === 1
                        ? "#CD853F" // wood color
                        : userLeague === 2
                        ? "#E8E8E8" // iron color
                        : "#FFD700", // gold color
                    textShadow: "0px 3px 10px rgba(255, 215, 0, 0.6)",
                  }}
                >
                  {userLeague === 1
                    ? "Wood"
                    : userLeague === 2
                    ? "Iron"
                    : "Gold"}{" "}
                  League
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  width: "100%",
                }}
              >
                {/* Top users avatars */}
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
                      gap: "7px",
                    }}
                  >
                    {topStreaksUsers.slice(0, 5).map(
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
                              marginLeft: index > 0 ? "-12px" : "0",
                              boxShadow: "0 0 3px rgba(0, 0, 0, 0.5)",
                              zIndex: 5 - index,
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
                    +{totActiveStreaks}{" "}
                    <span style={{ marginLeft: "5px" }}>active farmers</span>
                  </span>
                </div>

                {/* Countdown */}
                <div
                  style={{
                    fontSize: "10px",
                    color: "#FFF",
                    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                    fontFamily: "PressStart2P",
                  }}
                >
                  Starting on Monday 4PM CET
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
