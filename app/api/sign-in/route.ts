import { fetchUser } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { trackEvent } from "@/lib/posthog/server";
import { createAppClient, viemConnector } from "@farcaster/auth-client";
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

const appClient = createAppClient({
  relay: "https://relay.farcaster.xyz",
  ethereum: viemConnector({
    rpcUrls: [
      "https://mainnet.optimism.io",
      "https://1rpc.io/op",
      "https://optimism-rpc.publicnode.com",
      "https://optimism.drpc.org",
    ],
  }),
});

export const POST = async (req: NextRequest) => {
  const { nonce, signature, message, referrerFid } = await req.json();
  const isTestMode =
    !!env.NEXT_PUBLIC_IS_TEST_MODE && env.NEXT_PUBLIC_APP_ENV === "development";

  // Verify signature matches custody address and auth address
  const {
    data,
    success,
    fid: fidFromSignature,
  } = await appClient.verifySignInMessage({
    domain: new URL(env.NEXT_PUBLIC_URL).hostname,
    nonce,
    message,
    signature,
    acceptAuthAddress: true,
  });
  let isValidSignature;
  if (isTestMode) {
    isValidSignature = true;
  } else {
    isValidSignature = success;
  }

  // Verify signature matches custody address and auth address (if not in test mode)
  if (!isValidSignature) {
    console.error(
      "Invalid signature",
      JSON.stringify(data, null, 2),
      "success",
      success,
      fidFromSignature
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let fid = fidFromSignature;
  if (isTestMode) {
    fid = await getRandomTestUserFid();
  }

  let user = await getUserByMode(fid, Mode.Classic);
  if (!user) {
    const newUser = await fetchUser(fid.toString());
    user = await createUserAndMode({
      fid,
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

    if (referrerFid) await addReferral(referrerFid, fid);

    trackEvent(fid, "sign_up", { fid });
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
    walletAddress: data.address,
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
