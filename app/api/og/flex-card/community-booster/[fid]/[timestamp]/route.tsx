import { env } from "@/lib/env";
import {
  getActiveStreaksCount,
  getCommunityBoosterPoints,
  getCommunityDonationById,
  getCurrentCommunityBooster,
  getTopStreaks,
  getUserByMode,
  TopStreaksResult,
} from "@/lib/prisma/queries";
import { UserWithStatistic } from "@/lib/prisma/types";
import { CropType, Mode } from "@/lib/types/game";
import {
  getCurrentPowerStateTarget,
  getGrowthTimeBasedOnMultiplier,
} from "@/lib/utils";
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
    const donationId = searchParams.get("id");

    if (!donationId) {
      return new Response("Donation ID is required", {
        status: 400,
      });
    }

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

    const donation = await getCommunityDonationById(donationId);

    if (!donation || donation.fid !== Number(fid) || donation.mode !== mode) {
      return new Response("Invalid donation", {
        status: 400,
      });
    }

    const currentCommunityBoosterStatus = await getCurrentCommunityBooster(
      mode
    );

    if (!currentCommunityBoosterStatus) {
      return new Response("Community booster not found", {
        status: 404,
      });
    }

    const communityBoosterPoints = await getCommunityBoosterPoints(mode);

    const { previous: previousStageTarget, target: powerStageTarget } =
      getCurrentPowerStateTarget(communityBoosterPoints.points);

    const pointsToFill = powerStageTarget - previousStageTarget;
    const filledPoints = communityBoosterPoints.points - previousStageTarget;

    // Calculate completion percentage based on current points and target
    const completionPercentage =
      filledPoints >= pointsToFill
        ? 100
        : Math.max(
            1,
            Math.min(Math.floor((filledPoints / pointsToFill) * 100), 99)
          );

    const userDonationPercentage = Math.min(
      Math.floor((donation.ptAmount / pointsToFill) * 100),
      100
    );

    const carrotGrowthTime = getGrowthTimeBasedOnMultiplier(
      CropType.Carrot,
      currentCommunityBoosterStatus.stage,
      true
    ) as string;
    const pumpkinGrowthTime = getGrowthTimeBasedOnMultiplier(
      CropType.Pumpkin,
      currentCommunityBoosterStatus.stage,
      true
    ) as string;

    const stats = [
      {
        name: "Combo",
        value: `x${communityBoosterPoints.combo}`,
      },
      {
        name: "Game speed",
        value: `x${currentCommunityBoosterStatus?.stage}`,
      },
      {
        name: "Stage status",
        value: `${completionPercentage}%`,
      },
      {
        name: "Missing FPs",
        value: Math.max(powerStageTarget - communityBoosterPoints.points, 0),
      },
    ];

    const topStreaks: TopStreaksResult[] = await getTopStreaks();
    const totActiveStreaks = await getActiveStreaksCount();

    const topStreaksUsers: UserWithStatistic[] = [];
    for (const streak of topStreaks) {
      const user = await getUserByMode(streak.fid, mode);
      if (user) {
        topStreaksUsers.push(user);
      }
    }

    const appUrl = env.NEXT_PUBLIC_URL;

    const bgImageRes = await fetch(
      new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)
    );
    const bgImage = await bgImageRes.arrayBuffer();

    const fontData = await loadGoogleFont(
      "Press+Start+2P",
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
                I contributed with
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "5px",
                }}
              >
                <p
                  style={{
                    color: "#7FFF9B",
                    fontWeight: 700,
                    fontSize: "28px",
                  }}
                >
                  +{donation.ptAmount}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    color: "#7FFF9B",
                    fontWeight: 400,
                    fontSize: "12px",
                    gap: "4px",
                  }}
                >
                  <span>Farmers</span>
                  <span>Power</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: "10px",
              }}
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: "10px" }}>
                    {stat.name}
                  </span>
                  <span
                    style={{
                      color: "#FFA726",
                      fontSize: "22px",
                      fontWeight: 700,
                    }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: "26px",
                background: "rgba(145, 106, 51, 0.2)",
                borderRadius: "12px",
                margin: "12px 0 0 0",
                display: "flex",
                alignItems: "center",
                position: "relative",
                boxSizing: "border-box",
                border: "3px solid rgba(145, 106, 51, 0.4)",
              }}
            >
              {/* Orange progress */}
              <div
                style={{
                  width: `${completionPercentage - userDonationPercentage}%`,
                  height: "100%",
                  background: "#FFA726",
                  borderRadius: "12px 0 0 12px",
                  transition: "width 0.3s",
                }}
              />
              {/* Small green segment */}
              <div
                style={{
                  position: "absolute",
                  left: `${completionPercentage - userDonationPercentage}%`,
                  width: `${
                    userDonationPercentage > 0 ? userDonationPercentage : 0
                  }%`,
                  height: "100%",
                  background: "#7FFF9B",
                  borderRadius: "0 8px 8px 0",
                }}
              />
            </div>

            {/* Bottom with streaks and growth time legend */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: "25px",
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
                  flexDirection: "column",
                  alignItems: "flex-start",
                  fontSize: "10px",
                  color: "#fff",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: "#FFEFAE",
                    marginBottom: "5px",
                  }}
                >
                  Growth time:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <img
                    src={`${appUrl}/images/crop/carrot.png`}
                    width="20px"
                    height="20px"
                    style={{
                      objectFit: "cover",
                      border: "1px solid #322214",
                      borderRadius: "100%",
                      boxShadow: "0 0 3px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                  <span>carrot = {carrotGrowthTime}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <img
                    src={`${appUrl}/images/crop/pumpkin.png`}
                    width="20px"
                    height="20px"
                    style={{
                      objectFit: "cover",
                      border: "1px solid #322214",
                      borderRadius: "100%",
                      boxShadow: "0 0 3px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                  <span>pumpkin = {pumpkinGrowthTime}</span>
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
