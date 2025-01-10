import { getItemById, getUserItemByItemId, removeUserItem, addUserItem } from "@/supabase/queries";

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const fid = req.headers.get("fid");
  if (!fid) {
    return new Response("Fid not found", { status: 404 });
  }
  const itemId = Number((await params).id);
  const { quantity, toFid } = await req.json();

  const item = await getItemById(itemId);

  if (!item) {
    return new Response("Item not found", { status: 404 });
  }

  const userItem = await getUserItemByItemId(Number(fid), itemId);

  if (!userItem) {
    return new Response("User item not found", { status: 404 });
  }

  await removeUserItem(Number(fid), itemId, quantity);
  await addUserItem(Number(toFid), itemId, quantity);

  // TODO: update quest progress if present 

  return new Response("Item donated", { status: 200 });
};
