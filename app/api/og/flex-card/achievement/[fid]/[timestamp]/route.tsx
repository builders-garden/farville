import { env } from "@/lib/env";
import { ACHIEVEMENTS_THRESHOLDS } from "@/lib/game-constants";
import {
  getActiveStreaksCount,
  getTopStreaks,
  getUserByMode,
  TopStreaksResult,
} from "@/lib/prisma/queries";
import { UserWithStatistic } from "@/lib/prisma/types";
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
    const crop = searchParams.get("crop");
    const step = searchParams.get("step");

    const appUrl = env.NEXT_PUBLIC_URL;

    if (!fid) {
      return new Response("Farmer ID is required", {
        status: 400,
      });
    }

    if (!crop || !step) {
      return new Response("Crop and step are required", {
        status: 400,
      });
    }

    const user = await getUserByMode(Number(fid));

    const topStreaks: TopStreaksResult[] = await getTopStreaks();
    const totActiveStreaks = await getActiveStreaksCount();

    const topStreaksUsers: UserWithStatistic[] = [];
    for (const streak of topStreaks) {
      const user = await getUserByMode(streak.fid);
      if (user) {
        topStreaksUsers.push(user);
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
      new URL(
        `${appUrl}/images/badge/honours/${crop}-${step}.png`,
        import.meta.url
      )
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

    // TODO: add here a stronger validation for crop and step to be secure that the user has achieved this badge

    const cropAchievements = ACHIEVEMENTS_THRESHOLDS.find(
      (achievement) => achievement.crop === crop
    );
    const badgeData = {
      title:
        cropAchievements?.titles[Number(step) - 1] ||
        `Badge for ${crop} achievement`,
      description: `Obtained harvesting ${
        cropAchievements?.thresholds[Number(step) - 1]
      } ${
        crop.endsWith("y")
          ? crop.slice(0, crop.length - 1) + "ies"
          : crop.endsWith("o")
          ? crop + "es"
          : crop + "s"
      }.`,
    };

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
                }}
              >
                {/* Badge Title */}
                <span
                  style={{
                    fontSize: "20px",
                    color: "#FFD700",
                    textShadow: "0px 3px 10px rgba(255, 215, 0, 0.6)",
                    position: "relative",
                    lineHeight: "1.5",
                  }}
                >
                  {badgeData.title}
                </span>
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
                  {badgeData.description}
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
                            alt={`${streakUser.username}'s avatar`}
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
