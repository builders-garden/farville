import { ImageResponse } from "next/og";
import { getUser } from "@/supabase/queries";
import { getItemById } from "@/supabase/queries";

export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get("fid");
    const itemId = searchParams.get("itemId");
    const quantity = searchParams.get("quantity");

    const user = await getUser(Number(fid));
    const item = itemId ? await getItemById(Number(itemId)) : null;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Background Image */}
          <img
            src={`${process.env.NEXT_PUBLIC_URL}/images/bg-empty.png`}
            alt="Farm background"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
            }}
            width={1200}
            height={630}
          />

          {/* Dark Overlay */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
            }}
          />

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              padding: "40px",
              position: "relative",
              color: "white",
              textAlign: "center",
              gap: "20px",
            }}
          >
            {/* User Avatar */}
            {user?.avatarUrl && (
              <div style={{ display: "flex" }}>
                <img
                  src={user.avatarUrl}
                  alt="User avatar"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "60px",
                    border: "4px solid white",
                  }}
                />
              </div>
            )}

            {/* Username */}
            <div
              style={{
                fontSize: 32,
                marginTop: "20px",
                display: "flex",
                fontFamily: "Inter",
              }}
            >
              {user?.username || "User"}
            </div>

            {/* Request Details */}
            <div
              style={{
                fontSize: 48,
                fontWeight: "bold",
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex" }}>is looking for</div>
              <div
                style={{
                  color: "#FFD700",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                {item?.icon && (
                  <div
                    style={{
                      backgroundColor: "#8B4513",
                      padding: "8px",
                      borderRadius: "8px",
                      border: "2px solid #5C2E0B",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_URL}/images${item.icon}`}
                      alt={item?.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}
                {quantity} {item?.name || "items"}
              </div>
            </div>

            {/* Game Title */}
            <div
              style={{
                position: "absolute",
                bottom: "30px",
                fontSize: "24px",
                opacity: 0.8,
                display: "flex",
              }}
            >
              FarVille
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
