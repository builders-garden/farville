import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { getRequestById } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";

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
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    const request = await getRequestById(Number(id));

    if (!request) {
      return new Response("Request not found", {
        status: 404,
      });
    }

    const { user, item, quantity, mode } = request;

    const requestMode = mode as Mode;
    const text = user ? `is looking for` : "Farville";
    const secondaryText = item && quantity ? `${quantity} ${item.name}` : "";

    const appUrl = env.NEXT_PUBLIC_URL;
    const [bgImage, itemIcon] = await Promise.all([
      fetch(new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)).then(
        (res) => res.arrayBuffer()
      ),
      item?.icon
        ? fetch(new URL(`${appUrl}/images${item.icon}`, import.meta.url)).then(
            (res) => res.arrayBuffer()
          )
        : null,
    ]);

    const profilePic = user.selectedAvatarUrl ?? user.avatarUrl;

    const fontData = await loadGoogleFont(
      "Press+Start+2P",
      "Farville" + text + secondaryText + user?.username || ""
    );

    const ensName = user?.username || "";

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
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
          />

          {/* Glassy Container */}
          <div
            style={{
              display: "flex",
              width: "90%",
              height: "80%",
              background: "rgba(44, 25, 15, 0.6)", // More brown base background
              backdropFilter: "blur(16px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(44, 25, 15, 0.6)", // Brown shadow
              position: "relative",
              flexDirection: "column",
              padding: "25px",
              paddingTop: "30px",
              gap: "25px",
              alignItems: "center",
            }}
          >
            {requestMode !== Mode.Classic && (
              <div
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  width: "60px",
                  height: "60px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <img
                  src={`${appUrl}/images/modes/${requestMode}.png`}
                  width="48"
                  height="48"
                  style={{
                    objectFit: "contain",
                    borderRadius: "4px",
                  }}
                />
              </div>
            )}
            {/* Additional inner shadow for better text contrast */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(180deg, rgba(44, 25, 15, 0.2) 0%, rgba(44, 25, 15, 0.3) 100%)", // Brown gradient
                pointerEvents: "none",
              }}
            />

            {profilePic && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "40px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <img
                    src={profilePic}
                    width="80"
                    height="80"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.9)",
                    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
                    fontFamily: "PressStart2P",
                    margin: 0,
                  }}
                >
                  {ensName}
                </p>
              </div>
            )}

            <p
              style={{
                fontSize: "14px",
                fontFamily: "PressStart2P",
                textAlign: "center",
                color: "#ffffff",
                textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
                margin: "5px 0",
              }}
            >
              {text}
            </p>

            {request.itemId && quantity && item && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "rgba(126, 78, 49, 0.5)",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(126, 78, 49, 0.7)",
                }}
              >
                <p
                  style={{
                    fontSize: "20px",
                    color: "#FFD700",
                    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
                    fontFamily: "PressStart2P",
                    margin: 0,
                  }}
                >
                  {secondaryText}
                </p>
                {item.icon && (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={
                        itemIcon
                          ? `data:image/png;base64,${Buffer.from(
                              itemIcon
                            ).toString("base64")}`
                          : undefined
                      }
                      width="32"
                      height="32"
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
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
    console.log(`Failed to generate image`, e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
