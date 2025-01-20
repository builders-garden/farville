import { sendQuestsCalculation } from "@/app/api/grid-cells/[x]/[y]/utils";
import { sendDelayedNotification } from "@/lib/game-notifications";
import { trackEvent } from "@/lib/posthog/server";
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
  if (fid === toFid) {
    return NextResponse.json({ message: "Cannot donate to yourself" }, { status: 400 });
  }
  const item = await getItemById(itemId);

  if (!item) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  const userItem = await getUserItemByItemId(Number(fid), itemId);

  if (!userItem) {
    return NextResponse.json({ message: "User item not found" }, { status: 404 });
  }

  console.log("donating", quantity, toFid, requestId, itemId);

  await removeUserItem(Number(fid), itemId, quantity);
  await addUserItem(Number(toFid), itemId, quantity);

  if (requestId) {
    await incrementRequestFilledQuantity(Number(requestId), quantity);
  }

  const user = await getUser(Number(toFid));

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
