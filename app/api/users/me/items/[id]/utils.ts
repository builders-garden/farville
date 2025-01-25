import {
  addUserItem,
  getItemById,
  getUser,
  getUserItemByItemId,
  removeUserItem,
  updateUserCoins,
} from "@/supabase/queries";

export const buyItem = async (
  fid: number,
  itemId: number,
  quantity: number
) => {
  const user = await getUser(fid);
  if (!user) {
    return { error: "User not found" };
  }
  const item = await getItemById(itemId);
  if (!item || item.slug === "fertilizer" || !item.buyPrice) {
    return { error: "Item not found" };
  }

  if (user.coins < item.buyPrice * quantity) {
    return { error: "Insufficient funds" };
  }

  await addUserItem(user.fid, itemId, quantity);
  await updateUserCoins(user.fid, user.coins - item.buyPrice * quantity);
};

export const sellItem = async (
  fid: number,
  itemId: number,
  quantity: number
) => {
  const user = await getUser(fid);
  if (!user) {
    return { error: "User not found" };
  }
  const item = await getItemById(itemId);
  if (!item  || !item.sellPrice) {
    return { error: "Item not found" };
  }

  const userItem = await getUserItemByItemId(user.fid, itemId);
  if (!userItem) {
    return { error: "Item not found" };
  }

  if (userItem.quantity < quantity) {
    return { error: "Insufficient items" };
  }

  await removeUserItem(user.fid, itemId, quantity);
  await updateUserCoins(user.fid, user.coins + item.sellPrice * quantity);
};
