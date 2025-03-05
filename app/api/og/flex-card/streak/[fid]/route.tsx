import { ImageResponse } from "next/og";
// import { getUser } from "@/supabase/queries";

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
    }>;
  }
) {
  try {
    const { fid } = await params;

    if (!fid) {
      return new Response("Farmer ID is required", {
        status: 400,
      });
    }

    // For production, replace this with real data fetching:
    // const user = await getUser(Number(fid));
    // const streakData = await getUserStreak(Number(fid));

    // Mock data for now
    const mockUser = {
      username: "farmer_joe",
      avatarUrl: "https://avatars.githubusercontent.com/u/124",
    };

    const mockStreakData = {
      currentStreak: 132,
    };

    // Use mock data for development
    const user = mockUser;
    const streakData = mockStreakData;

    const appUrl = process.env.NEXT_PUBLIC_URL;
    // Fetch background image
    const bgImageRes = await fetch(
      new URL(`${appUrl}/images/bg-empty.png`, import.meta.url)
    );
    const bgImage = await bgImageRes.arrayBuffer();

    // Fetch fire icon
    const fireIconRes = await fetch(
      new URL(`${appUrl}/images/special/fire.png`, import.meta.url)
    );
    const fireIcon = await fireIconRes.arrayBuffer();

    let profilePic = null;
    if (user?.avatarUrl) {
      const profilePicRes = await fetch(user.avatarUrl);
      if (profilePicRes.ok) {
        profilePic = await profilePicRes.arrayBuffer();
      }
    }

    const calendarRes = await fetch(
      new URL(`${appUrl}/images/flex-cards/calendar.svg`, import.meta.url)
    );
    const calendarSvg = await calendarRes.text();
    const farmerRes = await fetch(
      new URL(`${appUrl}/images/flex-cards/farmer.svg`, import.meta.url)
    );
    const farmerSvg = await farmerRes.text();

    // Format current date
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;

    const username = user?.username || "Farmer";

    const fontData = await loadGoogleFont(
      "Press+Start+2P",
      username +
        "Streak" +
        "I'm on a " +
        streakData.currentStreak +
        " days streak on FarVille!" +
        "let's farm 🌱" +
        formattedDate
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
              background: "linear-gradient(135deg, #7E4E31 0%, #6d4c2c 100%)",
              borderRadius: "16px",
              border: "3px solid #593F23",
              overflow: "hidden",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
              position: "relative",
              flexDirection: "column",
              padding: "20px",
              justifyContent: "space-between",
            }}
          >
            {/* Title - Matching the game's headers */}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "7.5px 10px",
                  background: "rgba(0, 0, 0, 0.2)",
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
              {/* Date display instead of profile picture */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(0, 0, 0, 0.2)",
                  padding: "7.5px 10px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
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
            {/* Left Section - Details */}
            <div
              style={{
                display: "flex",
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "10px",
                padding: "7px",
                width: "100%",
              }}
            >
              {/* Playful message about the streak */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "15px",
                  fontFamily: "PressStart2P",
                  alignItems: "flex-start",
                  gap: "12px",
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
                  I&apos;m on a
                </span>
                <span
                  style={{
                    fontSize: "40px",
                    color: "#FFB938",
                    textShadow: "0px 3px 6px rgba(0, 0, 0, 0.8)",
                    marginBottom: "8px",
                  }}
                >
                  {streakData.currentStreak}
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
                      fontSize: "14px",
                      color: "#ffffff",
                      textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                      marginBottom: "8px",
                    }}
                  >
                    days streak
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#ffffff",
                      textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                      marginBottom: "8px",
                    }}
                  >
                    on FarVille!
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#7BF054",
                    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                  }}
                >
                  let&apos;s farm 🌱
                </span>
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
                {/* Profile picture in center */}
                <div
                  style={{
                    width: "145px",
                    height: "145px",
                    borderRadius: "100%",
                    border: "3px solid #FFB938",
                    overflow: "hidden",
                    backgroundColor: "#5B4120",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                    boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
                  }}
                >
                  {profilePic && (
                    <img
                      src={`data:image/png;base64,${Buffer.from(
                        profilePic
                      ).toString("base64")}`}
                      width="100%"
                      height="100%"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                {/* Small fire icons around profile picture */}
                {[
                  // Top position
                  {
                    top: "-5px",
                    left: "60%",
                    marginLeft: "-15px",
                    rotation: "-20deg",
                    size: "65px",
                  },
                  // Right position
                  {
                    top: "60%",
                    marginTop: "-20px",
                    right: "20px",
                    rotation: "10deg",
                    size: "90px",
                  },
                  // Bottom position
                  {
                    bottom: "5px",
                    left: "40%",
                    marginLeft: "-30px",
                    rotation: "0deg",
                    size: "50px",
                  },
                  // Left position
                  {
                    top: "40%",
                    marginTop: "-55px",
                    left: "30px",
                    rotation: "-10deg",
                    size: "75px",
                  },
                ].map((position, index) => (
                  <img
                    key={index}
                    src={`data:image/png;base64,${Buffer.from(
                      fireIcon
                    ).toString("base64")}`}
                    width={position.size}
                    height={position.size}
                    style={{
                      position: "absolute",
                      objectFit: "contain",
                      transform: `rotate(${position.rotation})`,
                      ...position,
                      zIndex: 2,
                    }}
                  />
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
    console.log(`Failed to generate streak image`, e);
    return new Response(`Failed to generate streak image`, {
      status: 500,
    });
  }
}
