import { fetchUser } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";
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
import { initQuestsAndLeaderboardEntry } from "@/lib/utils";
import { env } from "@/lib/env";
import { Mode } from "@/lib/types/game";
import { getRandomTestUserFid } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
  const data = await req.json();
  const { referrerFid, signature, message } = data;
  const isTestMode =
    !!env.NEXT_PUBLIC_IS_TEST_MODE && env.NEXT_PUBLIC_APP_ENV === "development";

  let fid = data.fid;
  if (isTestMode) {
    fid = await getRandomTestUserFid();
  }

  let user = await getUserByMode(fid, Mode.Classic);

  if (!user) {
    const newUser = await fetchUser(fid);
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

  // Verify signature matches custody address
  let isValidSignature;
  if (isTestMode) {
    isValidSignature = true;
  } else {
    isValidSignature = await verifyMessage({
      address: user.walletAddress as `0x${string}`,
      message,
      signature,
    });
  }

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
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
    timestamp: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30 days")
    .sign(new TextEncoder().encode(env.JWT_SECRET));

  const response = NextResponse.json({ success: true, token: jwtToken });

  trackEvent(fid, "sign_in", {
    fid,
  });

  return response;
};
