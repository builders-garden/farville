import { MAX_FROSTS_QUANTITY } from "@/lib/game-constants";
import { PerkType, SpecialItemType } from "@/lib/types/game";
import {
  addUserItem,
  getItemById,
  getUserByMode,
  getUserItemByItemId,
  removeUserItem,
  updateUserCoins,
} from "@/lib/prisma/queries";

export const buyItem = async (
  fid: number,
  itemId: number,
  quantity: number
) => {
  const user = await getUserByMode(fid);
  if (!user) {
    return {
      success: false,
      message: "User not found",
      status: 404,
    };
  }
  const item = await getItemById(itemId);
  if (!item || !item.buyPrice) {
    return {
      success: false,
      message: "Item not found",
      status: 404,
    };
  }

  // Check if item is not available for purchase
  // if buyPrice is null the item is not available for purchase
  if (item.slug === PerkType.Fertilizer || item.buyPrice === null) {
    return {
      success: false,
      message: "Item not available for purchase",
      status: 400,
    };
  }

  // frosts quantity cannot exceed MAX_FROSTS_QUANTITY at the same time
  if (item.slug === SpecialItemType.Frost) {
    const userFrost = await getUserItemByItemId(user.fid, itemId);
    if (
      (userFrost && userFrost.quantity + quantity > MAX_FROSTS_QUANTITY) ||
      quantity > MAX_FROSTS_QUANTITY
    ) {
      return {
        success: false,
        message: "Cannot have more than 2 frosts at the same time",
        status: 400,
      };
    }
  }

  if (user.coins < item.buyPrice * quantity) {
    return {
      success: false,
      message: "Insufficient coins",
      status: 400,
    };
  }

  await addUserItem(user.fid, itemId, quantity);
  await updateUserCoins(user.fid, user.coins - item.buyPrice * quantity);
  return { success: true };
};

export const sellItem = async (
  fid: number,
  itemId: number,
  quantity: number
) => {
  const user = await getUserByMode(fid);
  if (!user) {
    return { success: false, message: "User not found", status: 404 };
  }
  const item = await getItemById(itemId);
  if (!item || !item.sellPrice) {
    return { success: false, message: "Item not found", status: 404 };
  }

  // Check if item is not available for selling
  // if sellPrice is null the item is not available for selling
  if (item.slug === PerkType.Fertilizer || item.sellPrice === null) {
    return {
      success: false,
      message: "Item not available for selling",
      status: 400,
    };
  }

  const userItem = await getUserItemByItemId(user.fid, itemId);
  if (!userItem) {
    return {
      success: false,
      message: "User does not have this item",
      status: 404,
    };
  }

  if (userItem.quantity < quantity) {
    return {
      success: false,
      message: "User does not have enough of this item",
      status: 400,
    };
  }

  await removeUserItem(user.fid, itemId, quantity);
  await updateUserCoins(user.fid, user.coins + item.sellPrice * quantity);
  return { success: true };
};
