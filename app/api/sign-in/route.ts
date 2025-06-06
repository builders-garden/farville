import { createClient, Errors } from "@farcaster/quick-auth";
import { fetchUser } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";
import { Address, zeroAddress } from "viem";
import * as jose from "jose";
import { trackEvent } from "@/lib/posthog/server";
import {
  addReferral,
  createUserAndMode,
  getUserByMode,
  getUserGridCells,
  getUserModes,
  giftStarterPack,
  initializeGrid,
} from "@/lib/prisma/queries";
import {
  initQuestsAndLeaderboardEntry,
  userIsNotAdminAndIsNotProduction,
} from "@/lib/utils";
import { env } from "@/lib/env";
import { Mode } from "@/lib/types/game";
import { getRandomTestUserFid } from "@/lib/utils";

export const dynamic = "force-dynamic";

const quickAuthClient = createClient();

export const POST = async (req: NextRequest) => {
  const { referrerFid, token: farcasterToken } = await req.json();
  const isTestMode =
    !!env.NEXT_PUBLIC_IS_TEST_MODE && env.NEXT_PUBLIC_APP_ENV === "development";

  let fid;
  let isValidSignature;
  let walletAddress: Address = zeroAddress;
  let expirationTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  if (isTestMode) {
    isValidSignature = true;
    fid = await getRandomTestUserFid();
    walletAddress = zeroAddress;
    // expirationTime already set
  } else {
    try {
      const payload = await quickAuthClient.verifyJwt({
        domain: new URL(env.NEXT_PUBLIC_URL).hostname,
        token: farcasterToken,
      });
      isValidSignature = !!payload;
      fid = payload.sub;
      walletAddress = payload.address as `0x${string}`;
      expirationTime = payload.exp;
    } catch (e) {
      if (e instanceof Errors.InvalidTokenError) {
        console.error("Invalid token", e);
        isValidSignature = false;
      }
      console.error("Error verifying token", e);
    }
  }

  if (!isValidSignature || !fid) {
    return NextResponse.json(
      { success: false, error: "Invalid token" },
      { status: 401 }
    );
  }

  if (!isTestMode && userIsNotAdminAndIsNotProduction(Number(fid)))
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  let user = await getUserByMode(fid, Mode.Classic);
  if (!user) {
    const newUser = await fetchUser(fid.toString());
    user = await createUserAndMode({
      fid: fid,
      username: newUser.username,
      displayName: newUser.display_name,
      avatarUrl: newUser.pfp_url,
      walletAddress: newUser.custody_address,
      statistics: {
        create: {
          mode: Mode.Classic,
          xp: 0,
          coins: 0,
          expansions: 1,
        },
      },
    });

    if (referrerFid) {
      await addReferral(referrerFid, fid);
    }

    trackEvent(fid, "sign_up", {
      fid,
    });
  }

  // check if the user has already the grid cells
  // if not, initialize the grid
  const gridCells = await getUserGridCells(fid, Mode.Classic);
  if (gridCells.length === 0) {
    await initializeGrid(fid, Mode.Classic);
    // Give them a starter pack
    await giftStarterPack(fid, Mode.Classic);
  }

  const userModes = await getUserModes(fid);
  await initQuestsAndLeaderboardEntry(fid, userModes);

  // Generate a session token using fid and current timestamp
  const jwtToken = await new jose.SignJWT({
    fid,
    walletAddress,
    timestamp: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(new TextEncoder().encode(env.JWT_SECRET));

  const response = NextResponse.json({ success: true, token: jwtToken });

  // Set the auth cookie with the JWT token
  response.cookies.set({
    name: "auth_token",
    value: jwtToken,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  trackEvent(fid, "sign_in", {
    fid,
  });

  return response;
};
