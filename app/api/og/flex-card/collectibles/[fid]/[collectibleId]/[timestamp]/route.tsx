/* eslint-disable @next/next/no-img-element */
import { getPlayerCount } from "@/lib/prisma/queries";
import { getGlobalLeaderboard } from "@/lib/utils";
import { getUser, getUserCollectibleByCollectibleId } from "@/supabase/queries";
import { DbUser } from "@/supabase/types";
import { ImageResponse } from "next/og";
import { CollectibleStatus } from "@/types/game";
import { env } from "@/lib/env";

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
      collectibleId: string;
      timestamp: string;
    }>;
  }
) {
  try {
    const { fid, collectibleId } = await params;

    const appUrl = env.NEXT_PUBLIC_URL;

    if (!fid) {
      return new Response("Farmer ID is required", {
        status: 400,
      });
    }
    if (!collectibleId || isNaN(Number(collectibleId))) {
      return new Response("Collectible ID is required", {
        status: 400,
      });
    }

    const user = await getUser(Number(fid));

    const userCollectible = await getUserCollectibleByCollectibleId(
      Number(fid),
      Number(collectibleId)
    );

    if (
      !userCollectible ||
      !userCollectible.mintedImageUrl ||
      userCollectible.status !== CollectibleStatus.Minted
    ) {
      return new Response("User has not minted a PFP NFT", {
        status: 400,
      });
    }

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

    const badgeImage = await fetch(new URL(userCollectible.mintedImageUrl));
    const badgeImageBuffer = await badgeImage.arrayBuffer();

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
              height: "auto",
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
            {/* Achievement Info */}
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
                gap: "20px",
              }}
            >
              {/* Left Part - Badge */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px",
                  fontFamily: "PressStart2P",
                  alignItems: "flex-start",
                  gap: "22px",
                  width: "200px",
                }}
              >
                {/* Gold aura around badge picture */}
                <div
                  style={{
                    position: "absolute",
                    width: "200px",
                    height: "200px",
                    borderRadius: "12%",
                    background:
                      "radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)",
                    zIndex: 0,
                  }}
                />
                {/* Badge image in center */}
                <div
                  style={{
                    width: "195px",
                    height: "195px",
                    borderRadius: "12%",
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
                      alt="Custom PFP Avatar"
                      style={{
                        objectFit: "contain",
                        filter: "drop-shadow(0 0 3px rgba(255,215,0,0.5))",
                      }}
                    />
                  }
                </div>
              </div>

              {/* Right Section */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  padding: "12px",
                  wordWrap: "break-word",
                  gap: "12px",
                  width: "280px",
                  height: "100%",
                }}
              >
                {/* Badge Title */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "17px",
                      color: "#FFD700",
                      textShadow: "0px 3px 10px rgba(255, 215, 0, 0.6)",
                      position: "relative",
                      lineHeight: "1.5",
                    }}
                  >
                    Farville Farmer
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      color: "#FFD700",
                      textShadow: "0px 3px 10px rgba(255, 215, 0, 0.6)",
                      position: "relative",
                      lineHeight: "1.5",
                    }}
                  >
                    #{fid}
                  </span>
                </div>
                {/* Badge Description */}
                <span
                  style={{
                    fontSize: "12px",
                    color: "#ffffff",
                    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                    textWrap: "wrap",
                    lineHeight: "1.8",
                  }}
                >
                  {username} minted his custom Farville Farmer.
                </span>
                {/* Top Leaderboard Users */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                    marginTop: "auto",
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
                            alt="PFP Avatar"
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
