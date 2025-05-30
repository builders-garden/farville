import { env } from "@/lib/env";
import {
  getActiveStreaksCount,
  getCurrentCommunityBooster,
  getTopStreaks,
  getUserByMode,
  getUserCommunityDonationsLeaderboardRaw,
  TopStreaksResult,
} from "@/lib/prisma/queries";
import { UserWithStatistic } from "@/lib/prisma/types";
import { Mode } from "@/lib/types/game";
import { getCommunityBoostMultiplier } from "@/lib/utils";
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
    const mode = searchParams.get("mode") as Mode;
    const isFarcasterManiaOn = searchParams.get("farcasterMania") === "true";

    if (!fid) {
      return new Response("Farmer ID is required", {
        status: 400,
      });
    }

    const user = await getUserByMode(Number(fid), mode);

    if (!user) {
      return new Response("User not found", {
        status: 404,
      });
    }

    // get here top 5 farmer donors
    const topDonors = await getUserCommunityDonationsLeaderboardRaw(
      5,
      mode as Mode,
      Number(fid)
    );

    const topStreaks: TopStreaksResult[] = await getTopStreaks();
    const totActiveStreaks = await getActiveStreaksCount();

    const topStreaksUsers: UserWithStatistic[] = [];
    for (const streak of topStreaks) {
      const user = await getUserByMode(streak.fid, mode);
      if (user) {
        topStreaksUsers.push(user);
      }
    }

    const currentCommunityBoosterStatus = await getCurrentCommunityBooster(
      mode
    );

    if (!currentCommunityBoosterStatus) {
      return new Response("Community booster not found", {
        status: 404,
      });
    }

    const currentGameSpeed = getCommunityBoostMultiplier(
      currentCommunityBoosterStatus.stage
    );

    const appUrl = env.NEXT_PUBLIC_URL;

    const bgImageRes = await fetch(
      new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)
    );
    const bgImage = await bgImageRes.arrayBuffer();

    const fontData = await loadGoogleFont(
      "Press+Start+2P",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,.<>/?"
    );

    const secondaryColor = isFarcasterManiaOn ? "#9177e0" : "#FFA726";

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
                "linear-gradient(145deg, rgba(43, 27, 16, 0.7) 0%, rgba(0, 0, 0, 0.6) 100%)",
              backdropFilter: "blur(16px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              overflow: "hidden",
              boxShadow: "0 8px 26px rgba(44, 25, 15, 0.6)",
              position: "relative",
              flexDirection: "column",
              padding: "15px",
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
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                fontSize: "14px",
                marginBottom: "18px",
                color: "#FFFFFF",
                gap: "15px",
              }}
            >
              <p
                style={{
                  fontWeight: 400,
                }}
              >
                Thank you farmer friends 💜
              </p>
            </div>

            {/* Top donors row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: "25px",
                marginBottom: "30px",
                marginTop: "15px",
              }}
            >
              {topDonors.leaderboard.map((donor, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <img
                    src={donor.selectedAvatarUrl || donor.avatarUrl || ""}
                    width="72px"
                    height="72px"
                    style={{
                      objectFit: "cover",
                      border: `2px solid ${secondaryColor}`,
                      borderRadius: "100%",
                      imageRendering: "auto",
                      boxShadow:
                        index === 0
                          ? "0 0 15px rgba(255, 215, 0, 0.7)" // Gold
                          : index === 1
                          ? "0 0 15px rgba(192, 192, 192, 0.7)" // Silver
                          : index === 2
                          ? "0 0 15px rgba(205, 127, 50, 0.7)" // Bronze
                          : "0 0 6px rgba(0, 0, 0, 0.5)", // Default
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                fontSize: "12px",
                color: "#FFFFFF",
                gap: "15px",
              }}
            >
              <p
                style={{
                  fontWeight: 400,
                }}
              >
                for contributing to speeding up the game
              </p>
            </div>

            {/* Bottom with streaks and growth time legend */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: "20px",
              }}
            >
              {/* Top Streaks Users */}
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
                  +{totActiveStreaks}{" "}
                  <span style={{ marginLeft: "5px" }}>active streaks</span>
                </span>
              </div>
              {/* Growth time legend */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  fontSize: "10px",
                  color: "#fff",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: "#FFEFAE",
                  }}
                >
                  Growth time is {currentGameSpeed}x now!
                </span>
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
