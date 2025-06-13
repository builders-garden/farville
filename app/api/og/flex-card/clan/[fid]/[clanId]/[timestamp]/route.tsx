import { env } from "@/lib/env";
import { getUserByMode, getClanById } from "@/lib/prisma/queries";
import { ClanWithData } from "@/lib/prisma/types";
import { Mode } from "@/lib/types/game";
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
      clanId: string;
      timestamp: string;
    }>;
  }
) {
  try {
    const { fid, clanId } = await params;

    const mode = Mode.Classic;

    if (!fid) {
      return new Response("Farmer ID is required", {
        status: 400,
      });
    }

    if (!clanId) {
      return new Response("Clan ID is required", {
        status: 400,
      });
    }

    const user = await getUserByMode(Number(fid), mode);
    const clan = (await getClanById(clanId, {
      includeMembers: true,
      includeLeader: true,
    })) as unknown as ClanWithData;

    if (!clan) {
      return new Response("Clan not found", {
        status: 404,
      });
    }

    // Get clan members for display
    const clanMembers = clan.members || [];

    const appUrl = env.NEXT_PUBLIC_URL;

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

    const defaultClanImageRes = await fetch(
      new URL(`${appUrl}/images/icons/clans.png`, import.meta.url)
    );
    const defaultClanImage = await defaultClanImageRes.arrayBuffer();

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;

    const username = user?.username || "Farmer";
    const memberCount = clan.members?.length || 0;

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
              background: "rgba(44, 25, 15, 0.6)",
              backdropFilter: "blur(16px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(44, 25, 15, 0.6)",
              position: "relative",
              flexDirection: "column",
              padding: "15px",
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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: "15px",
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
            {/* Clan Info */}
            <div
              style={{
                display: "flex",
                flex: "1",
                background:
                  "linear-gradient(145deg, rgba(43, 27, 16, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%)",
                borderRadius: "10px",
                padding: "7px",
                width: "100%",
                boxShadow:
                  "inset 0 0 10px rgba(0, 0, 0, 0.3), 0 0 5px rgba(255, 215, 0, 0.15)",
                minHeight: "0",
              }}
            >
              {/* Left Part */}
              <div
                style={{
                  flex: "1.5",
                  display: "flex",
                  flexDirection: "column",
                  padding: "15px",
                  fontFamily: "PressStart2P",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                {/* Top content */}
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
                      marginBottom: "8px",
                    }}
                  >
                    Join my Feud
                  </span>
                  <span
                    style={{
                      fontSize: "24px",
                      color: "#FFB938",
                      textShadow: "0px 3px 10px rgba(255, 185, 56, 0.6)",
                      marginBottom: "8px",
                      position: "relative",
                    }}
                  >
                    {clan.name}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#ffffff",
                        textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                        marginBottom: "4px",
                      }}
                    >
                      Level {Math.floor(clan.xp / 1000) || 1}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: clan.isPublic ? "#4ADE80" : "#F87171",
                        textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                        marginBottom: "8px",
                      }}
                    >
                      {clan.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>

                {/* Clan Members - positioned at bottom */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                    width: "100%",
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
                    {clanMembers.slice(0, 5).map(
                      (member, index: number) =>
                        (member.user?.selectedAvatarUrl ||
                          member.user?.avatarUrl) && (
                          <img
                            key={index}
                            src={
                              member.user.selectedAvatarUrl ||
                              member.user.avatarUrl ||
                              ""
                            }
                            alt={`Clan member ${index + 1} avatar`}
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
                    {memberCount} {memberCount === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>

              {/* Right Section - Clan shield or image */}
              <div
                style={{
                  flex: "1",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  marginLeft: "-20px",
                }}
              >
                {/* Gold aura around clan image */}
                <div
                  style={{
                    position: "absolute",
                    width: "165px",
                    height: "165px",
                    borderRadius: "100%",
                    background:
                      "radial-gradient(circle, rgba(255,185,56,0.4) 0%, rgba(255,185,56,0) 70%)",
                    zIndex: 0,
                  }}
                />
                {/* Clan image or shield in center */}
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
                      "0 8px 20px rgba(0,0,0,0.7), 0 0 25px rgba(255,185,56,0.6), 0 0 10px #FFB938",
                  }}
                >
                  {clan.imageUrl && clan.imageUrl !== "" ? (
                    <img
                      src={clan.imageUrl}
                      width="100%"
                      height="100%"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <img
                      src={`data:image/png;base64,${Buffer.from(
                        defaultClanImage
                      ).toString("base64")}`}
                      width="60%"
                      height="60%"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                {/* Small shield icons around clan image */}
                {[
                  {
                    top: "10px",
                    left: "65%",
                    marginLeft: "-15px",
                    rotation: "-20deg",
                    size: "40px",
                  },
                  {
                    top: "65%",
                    marginTop: "-20px",
                    right: "25px",
                    rotation: "10deg",
                    size: "35px",
                  },
                  {
                    bottom: "15px",
                    left: "35%",
                    marginLeft: "-30px",
                    rotation: "0deg",
                    size: "30px",
                  },
                  {
                    top: "35%",
                    marginTop: "-50px",
                    left: "20px",
                    rotation: "-10deg",
                    size: "45px",
                  },
                ].map((position, index) => (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      fontSize: position.size,
                      transform: `rotate(${position.rotation})`,
                      filter: "drop-shadow(0 0 3px rgba(255,185,56,0.5))",
                      ...position,
                      zIndex: 2,
                    }}
                  >
                    🛡️
                  </div>
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
    console.log(`Failed to generate clan image`, e);
    return new Response(`Failed to generate clan image`, {
      status: 500,
    });
  }
}
