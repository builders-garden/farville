import { sendQuestsCalculation } from "@/app/api/grid-cells/utils";
import { XP_PER_DONATED_ITEM } from "@/lib/game-constants";
import { sendDelayedNotification } from "@/lib/game-notifications";
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
} from "@/lib/prisma/queries";
import { userCanDonate } from "@/lib/utils";
import { Mode, PerkType, SpecialItemType } from "@/lib/types/game";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  quantity: z.number().min(1).max(10),
  toFid: z.number().min(1),
  requestId: z.number(),
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

  if (!canDonateToReceiver && !canDonateToAnotherUser) {
    return NextResponse.json(
      {
        message: `You have reached the maximum daily donation limits.`,
      },
      { status: 400 }
    );
  }

  await removeUserItem(Number(fid), itemId, quantity, mode);
  await addUserItem(Number(toFid), itemId, quantity, mode);
  const userAfterUpdate = await updateUserXP(
    Number(fid),
    quantity * XP_PER_DONATED_ITEM,
    mode
  );
  await updateUserWeeklyScore(
    Number(fid),
    quantity * XP_PER_DONATED_ITEM,
    userAfterUpdate.newLevel,
    user.xp,
    userAfterUpdate.didLevelUp,
    mode
  );

  await incrementRequestFilledQuantity(Number(requestId), quantity);

  // POST: the user can donate
  // create or update here the user donation history
  await updateUserDonationHistory({
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
  });

  await Promise.all([
    sendQuestsCalculation(Number(fid), "donate", mode, itemId, quantity),
    sendQuestsCalculation(Number(toFid), "receive", mode, itemId, quantity),
    sendDelayedNotification(
      toFid.toString(),
      "New Donation!",
      `${user?.username} donated ${quantity} ${item.name} to you!`,
      "donation",
      0
    ),
  ]);

  return NextResponse.json({ message: "Item donated" }, { status: 200 });
};
