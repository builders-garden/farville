import { calculateUserQuestsProgress } from "@/app/api/grid-cells/[x]/[y]/utils";
import { trackEvent } from "@/lib/posthog/server";
import {
  getItemById,
  getUserItemByItemId,
  removeUserItem,
  addUserItem,
  incrementRequestFilledQuantity,
} from "@/supabase/queries";

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

  const item = await getItemById(itemId);

  if (!item) {
    return new Response("Item not found", { status: 404 });
  }

  const userItem = await getUserItemByItemId(Number(fid), itemId);

  if (!userItem) {
    return new Response("User item not found", { status: 404 });
  }

  console.log("donating", quantity, toFid, requestId, itemId);

  await removeUserItem(Number(fid), itemId, quantity);
  await addUserItem(Number(toFid), itemId, quantity);

  if (requestId) {
    await incrementRequestFilledQuantity(Number(requestId), quantity);
  }

  await calculateUserQuestsProgress(
    Number(fid),
    "donate",
    Number(itemId),
    Number(quantity)
  );

  trackEvent(Number(fid), "donated-item", {
    itemId: itemId,
    itemSlug: item.slug,
    quantity: quantity,
    toFid: toFid,
  });

  return new Response("Item donated", { status: 200 });
};
