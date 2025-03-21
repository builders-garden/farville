import {
  getActiveStreaksCount,
  getTopStreaks,
  getUserItemBySlug,
  TopStreaksResult,
} from "@/lib/prisma/queries";
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

    const appUrl = process.env.NEXT_PUBLIC_URL;

    if (!fid) {
      return new Response("Farmer ID is required", {
        status: 400,
      });
    }

    if (!crop) {
      return new Response("Crop and amount are required", {
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

    const bgImageRes = await fetch(
      new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)
    );
    const bgImage = await bgImageRes.arrayBuffer();

    const goldCropBadgeImage = await fetch(
      new URL(`${appUrl}/images/badge/gold-crops/${crop}.png`, import.meta.url)
    );
    const badgeImageBuffer = await goldCropBadgeImage.arrayBuffer();

    const fontData = await loadGoogleFont(
      "Press+Start+2P",
      // put here all the text that it's potentially going to be displayed
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,.<>/?"
    );

    // check that the user actually owned the gold crop
    const userSpecialCrops = await getUserItemBySlug(Number(fid), crop);

    if (!userSpecialCrops || userSpecialCrops.quantity < 1) {
      console.error(
        `User ${fid} does not own the specified crop ${crop} or has less than 1`
      );
      return new Response("User does not own the specified crop", {
        status: 400,
      });
    }

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
                  width: "180px",
                }}
              >
                {/* Gold aura around badge picture */}
                <div
                  style={{
                    position: "absolute",
                    width: "180px",
                    height: "180px",
                    borderRadius: "12%",
                    background:
                      "radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)",
                    zIndex: 0,
                  }}
                />
                {/* Badge image in center */}
                <div
                  style={{
                    width: "175px",
                    height: "175px",
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
                    fontSize: "18px",
                    color: "#FFD700",
                    textShadow: "0px 3px 10px rgba(255, 215, 0, 0.6)",
                    position: "relative",
                    lineHeight: "1.5",
                  }}
                >
                  New Gold Crop!
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
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
                    I just harvested a
                  </span>
                  <span style={{ fontSize: "12px", color: "#FFD700" }}>
                    {crop.replace("-", " ")}!
                  </span>
                </div>
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
