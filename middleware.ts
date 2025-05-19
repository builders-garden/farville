import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { validateQstashRequest } from "./lib/qstash";
import { env } from "@/lib/env";

export const config = {
  matcher: ["/api/:path*"],
};

export default async function middleware(req: NextRequest) {
  // Skip auth check for sign-in endpoint and other public endpoints
  if (
    req.nextUrl.pathname === "/api/sign-in" ||
    req.nextUrl.pathname.includes("/api/og") ||
    req.nextUrl.pathname.includes("/api/health") ||
    req.nextUrl.pathname.includes("/api/webhook") ||
    req.nextUrl.pathname.includes("/api/weekly-leaderboard") ||
    // Skip auth check for leaderboard API when called from server-side OG image generation
    (req.nextUrl.pathname === "/api/leaderboard" &&
      req.headers.get("user-agent")?.includes("Next.js OG"))
  ) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.includes("qstash")) {
    try {
      await validateQstashRequest(
        req.headers.get("Upstash-Signature")!,
        req.nextUrl.pathname
      );
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.toString() }, { status: 401 });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Get token from Authorization header
  const authHeader = req.headers.get("Authorization");
  console.log("authHeader", authHeader);
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7) // Remove "Bearer " prefix
    : null;
  console.log("token", token);

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    // Verify the token using jose
    const { payload } = await jose.jwtVerify(token, secret);

    // Clone the request headers to add user info
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-fid", payload.fid as string);

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
