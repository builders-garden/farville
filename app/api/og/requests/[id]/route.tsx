import { ImageResponse } from "next/og";
import { getRequestById } from "@/supabase/queries";

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

export async function GET(request: Request, {
    params
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  try {
    const { id } = await params;

    const request = await getRequestById(Number(id));

    if (!request) {
      return new Response("Request not found", {
        status: 404,
      });
    }

    const {user, item, quantity} = request;

    const text = user ? `is looking for` : "FarVille";
    const secondaryText = item && quantity ? `${quantity} ${item.name}` : "";

    const appUrl = process.env.NEXT_PUBLIC_URL;
    const [bgImage, profilePic, itemIcon] = await Promise.all([
      fetch(new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)).then(
        (res) => res.arrayBuffer()
      ),
      user?.avatarUrl
        ? fetch(user.avatarUrl).then((res) => res.arrayBuffer())
        : null,
      item?.icon
        ? fetch(new URL(`${appUrl}/images${item.icon}`, import.meta.url)).then(
            (res) => res.arrayBuffer()
          )
        : null,
    ]);

    const fontData = await loadGoogleFont(
      "Press+Start+2P",
      "FarVille" + text + secondaryText + user?.username || ""
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
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "20px",
              fontSize: "12px",
              color: "#ffffff",
              fontFamily: "PressStart2P",
              textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            FarVille
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              position: "relative",
            }}
          >
            {profilePic && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0px",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "25px",
                      border: "2px solid #fff",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={`data:image/png;base64,${Buffer.from(
                        profilePic
                      ).toString("base64")}`}
                      width="50"
                      height="50"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "rgba(255, 255, 255, 0.75)",
                      textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
                      fontFamily: "PressStart2P",
                      marginBottom: "16px",
                      textAlign: "center",
                      marginTop: "8px",
                    }}
                  >
                    {ensName}
                  </p>
                </div>
              </>
            )}
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "center",
                color: "#fff",
                textShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              }}
            >
              {text}
            </p>
            {request.itemId && quantity && item && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <p
                  style={{
                    fontSize: "24px",
                    marginTop: "16px",
                    color: "#fff",
                    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
                    fontFamily: "PressStart2P",
                  }}
                >
                  {secondaryText}
                </p>
                {item.icon && (
                  <div
                    style={{
                      marginLeft: "6px",
                      width: "24px",
                      height: "24px",
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
                      width="24"
                      height="24"
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
