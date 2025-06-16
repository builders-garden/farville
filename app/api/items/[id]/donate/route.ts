import { XP_PER_DONATED_ITEM } from "@/lib/game-constants";
import { sendDelayedNotificationToService } from "@/lib/game-notifications";
import {
  addUserItem,
  getItemById,
  getUserByMode,
  getUserDonationsOfToday,
  getUserItemByItemId,
  removeUserItem,
  updateUserDonationHistory,
  updateUserWeeklyScore,
  updateUserXP,
  incrementRequestFilledQuantity,
  getRequestById,
  getClanByFid,
  incrementClanXp,
  incrementUserContributedXp,
} from "@/lib/prisma/queries";
import { userCanDonate } from "@/lib/utils";
import { Mode, PerkType, SpecialItemType } from "@/lib/types/game";
import { NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";
import { env } from "@/lib/env";

const requestSchema = z.object({
  quantity: z.number().min(1).max(10),
  toFid: z.number().min(1),
  requestId: z.string(),
});

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return new Response("Fid not found", { status: 404 });
  }
  const itemId = Number((await params).id);
  if (isNaN(itemId)) {
    return new Response("Invalid item id", { status: 400 });
  }

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { quantity, toFid, requestId } = requestBody.data;

  const request = await getRequestById(requestId);

  if (!request) {
    return NextResponse.json({ message: "Request not found" }, { status: 404 });
  }

  const mode = request.mode as Mode;

  const user = await getUserByMode(Number(fid), mode);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // check if the user is donating to himself
  if (fid.toString() === toFid.toString()) {
    return NextResponse.json(
      { message: "Cannot donate to yourself" },
      { status: 400 }
    );
  }

  // check if the item exists
  const item = await getItemById(itemId);
  if (!item) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  // check if the item is available to be donated
  if (
    item.slug === SpecialItemType.Frost ||
    item.slug === PerkType.Fertilizer
  ) {
    return NextResponse.json(
      { message: "Item cannot be donated" },
      { status: 400 }
    );
  }

  // check if the user has enough items
  const userItem = await getUserItemByItemId(Number(fid), itemId, mode);
  if (!userItem || userItem.quantity < quantity) {
    return NextResponse.json(
      { message: "Not enough items to donate" },
      { status: 400 }
    );
  }

  const todayDonations = await getUserDonationsOfToday(Number(fid), mode);

  const {
    canDonateToReceiver,
    canDonateToAnotherUser,
    lastDonationToReceiver,
  } = userCanDonate(todayDonations, Number(toFid), mode);

  if (!canDonateToReceiver) {
    return NextResponse.json(
      {
        message: `You have reached the maximum daily donation limits with this user.`,
      },
      { status: 400 }
    );
  }

  if (!canDonateToAnotherUser) {
    return NextResponse.json(
      {
        message: `You have reached the maximum daily donation limits for today. Please try again tomorrow.`,
      },
      { status: 400 }
    );
  }

  const totalXp = quantity * XP_PER_DONATED_ITEM;

  const userAfterUpdate = await updateUserXP(Number(fid), totalXp, mode);

  // also check if we need to update the user's clan XP
  const userClan = await getClanByFid(Number(fid), {
    includeClan: false,
  });

  const promises: Promise<unknown>[] = [
    removeUserItem(Number(fid), itemId, quantity, mode),
    addUserItem(Number(toFid), itemId, quantity, mode),
    updateUserWeeklyScore(
      Number(fid),
      totalXp,
      userAfterUpdate.newLevel,
      user.xp,
      userAfterUpdate.didLevelUp,
      mode
    ),
    incrementRequestFilledQuantity(requestId, quantity),
    // create or update here the user donation history
    updateUserDonationHistory({
      donatorFid: Number(fid),
      receiverFid: Number(toFid),
      times:
        !lastDonationToReceiver ||
        new Date(lastDonationToReceiver.lastDonation).toDateString() !==
          new Date().toDateString()
          ? 1
          : (lastDonationToReceiver?.times ?? 0) + 1,
      lastDonation: new Date(),
      mode,
    }),
    axios({
      url: `${env.FARVILLE_SERVICE_URL}/api/async-jobs/quests-calculation`,
      method: "POST",
      headers: {
        "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
      },
      data: {
        fid: Number(fid),
        category: "donate",
        itemId,
        itemAmount: quantity,
        mode,
      },
    }),
    axios({
      url: `${env.FARVILLE_SERVICE_URL}/api/async-jobs/quests-calculation`,
      method: "POST",
      headers: {
        "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
      },
      data: {
        fid: Number(toFid),
        category: "receive",
        itemId,
        itemAmount: quantity,
        mode,
      },
    }),
    sendDelayedNotificationToService(
      toFid,
      "New Donation!",
      `${user?.username} donated ${quantity} ${item.name} to you!`,
      "donation",
      mode,
      0
    ),
  ];

  if (userClan) {
    promises.push(incrementClanXp(userClan.clanId, totalXp));
    promises.push(incrementUserContributedXp(Number(fid), totalXp));
  }

  await Promise.all(promises);

  return NextResponse.json({ message: "Item donated" }, { status: 200 });
};
