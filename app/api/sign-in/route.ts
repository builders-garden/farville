import { fetchUser } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";
import * as jose from "jose";
import {
  addReferral,
  createUser,
  getGridCells,
  getUser,
  getUserQuests,
  giftStarterPack,
  initializeGrid,
  initDailyUserQuests,
  initWeeklyUserQuests,
  // initMonthlyUserQuests,
} from "@/supabase/queries";
import { trackEvent } from "@/lib/posthog/server";

export const POST = async (req: NextRequest) => {
  const { fid, referrerFid, signature, message, userNow } = await req.json();

  let user = await getUser(fid);

  if (!user) {
    const newUser = await fetchUser(fid);
    user = await createUser({
      fid: fid,
      username: newUser.username,
      displayName: newUser.display_name,
      avatarUrl: newUser.pfp_url,
      walletAddress: newUser.custody_address,
      xp: 0,
      coins: 0,
      expansions: 1,
      notificationDetails: "",
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
  const gridCells = await getGridCells(fid);
  if (gridCells.length === 0) {
    await initializeGrid(fid);
    // Give them a starter pack
    await giftStarterPack(fid);
    // await initializeUserQuest(fid);
  }

  // Check if the user has daily, weekly and monthly quests
  // If not, initialize them
  const dailyQuests = await getUserQuests(fid, {
    type: ["daily"],
    activeToday: true,
    timeToCompare: userNow,
  });
  const weeklyQuests = await getUserQuests(Number(fid), {
    type: ["weekly"],
  });
  // const monthlyQuests = await getUserQuests(Number(fid), {
  //   type: ["monthly"],
  // });
  if (!dailyQuests || dailyQuests?.length === 0) {
    await initDailyUserQuests(Number(fid));
  }
  if (!weeklyQuests || weeklyQuests?.length === 0) {
    await initWeeklyUserQuests(Number(fid));
  }
  // if (!monthlyQuests || monthlyQuests?.length === 0) {
  //   await initMonthlyUserQuests(Number(fid));
  // }

  // Verify signature matches custody address
  const isValidSignature = await verifyMessage({
    address: user.walletAddress as `0x${string}`,
    message,
    signature,
  });

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  // Generate a session token using fid and current timestamp
  const jwtToken = await new jose.SignJWT({
    fid,
    timestamp: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30 days")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const response = NextResponse.json({ success: true, token: jwtToken });

  // response.cookies.set({
  //   name: "token",
  //   value: jwtToken,
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict",
  //   path: "/",
  //   maxAge: COOKIE_AGE,
  // });

  trackEvent(fid, "sign_in", {
    fid,
  });

  return response;
};
