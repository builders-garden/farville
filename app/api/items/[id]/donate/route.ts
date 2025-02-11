import { sendQuestsCalculation } from "@/app/api/grid-cells/[x]/[y]/utils";
import { MAX_DAILY_ALLOWED_DONATION_BETWEEN_USERS } from "@/lib/game-constants";
import { sendDelayedNotification } from "@/lib/game-notifications";
import { trackEvent } from "@/lib/posthog/server";
import {
  getUserDonationByReceiver,
  updateUserDonationHistory,
} from "@/lib/prisma/queries";
import {
  getItemById,
  getUserItemByItemId,
  removeUserItem,
  addUserItem,
  incrementRequestFilledQuantity,
  getUser,
} from "@/supabase/queries";
import { NextResponse } from "next/server";

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return new Response("Fid not found", { status: 404 });
  }
  const itemId = Number((await params).id);
  const { quantity, toFid, requestId } = await req.json();
  if (fid.toString() === toFid.toString()) {
    return NextResponse.json(
      { message: "Cannot donate to yourself" },
      { status: 400 }
    );
  }
  const item = await getItemById(itemId);

  if (!item) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  const userItem = await getUserItemByItemId(Number(fid), itemId);

  if (!userItem) {
    return NextResponse.json(
      { message: "User item not found" },
      { status: 404 }
    );
  }

  const userLastDonation = await getUserDonationByReceiver(
    Number(fid),
    Number(toFid)
  );

  if (
    userLastDonation &&
    userLastDonation.times >= MAX_DAILY_ALLOWED_DONATION_BETWEEN_USERS &&
    new Date(userLastDonation.lastDonation).toDateString() ===
      new Date().toDateString()
  ) {
    return NextResponse.json(
      {
        message: `You have reached the maximum daily donation limit of ${MAX_DAILY_ALLOWED_DONATION_BETWEEN_USERS} donations to ${toFid} user today`,
      },
      { status: 400 }
    );
  }

  await removeUserItem(Number(fid), itemId, quantity);
  await addUserItem(Number(toFid), itemId, quantity);

  if (requestId) {
    await incrementRequestFilledQuantity(Number(requestId), quantity);
  }

  const user = await getUser(Number(fid));

  // POST: the user can donate
  // create or update here the user donation history
  await updateUserDonationHistory({
    donatorFid: Number(fid),
    receiverFid: Number(toFid),
    times:
      !userLastDonation ||
      new Date(userLastDonation.lastDonation).toDateString() !==
        new Date().toDateString()
        ? 1
        : userLastDonation.times + 1,
    lastDonation: new Date().toISOString(),
  });

  await Promise.all([
    sendQuestsCalculation(Number(fid), "donate", itemId, quantity),
    sendQuestsCalculation(Number(toFid), "receive", itemId, quantity),
    sendDelayedNotification(
      toFid.toString(),
      "New Donation!",
      `${user?.username} donated ${quantity} ${item.name} to you!`,
      "donation",
      0
    ),
  ]);

  trackEvent(Number(fid), "donated-item", {
    itemId: itemId,
    itemSlug: item.slug,
    quantity: quantity,
    toFid: toFid,
  });

  return NextResponse.json({ message: "Item donated" }, { status: 200 });
};
