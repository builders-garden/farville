import { NextRequest, NextResponse } from "next/server";
import { buyItem, sellItem } from "./utils";
import { calculateUserQuestsProgress } from "@/app/api/grid-cells/[x]/[y]/utils";
import { trackEvent } from "@/lib/posthog/server";

export const POST = async (req: NextRequest) => {
  const { action, itemId, quantity } = await req.json();
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  switch (action) {
    case "buy":
      await buyItem(Number(fid), Number(itemId), Number(quantity));
      trackEvent(Number(fid), "bought-item", {
        itemId: itemId,
        quantity: quantity,
      });
      return NextResponse.json({ message: "Item bought" }, { status: 200 });
    case "sell":
      await sellItem(Number(fid), Number(itemId), Number(quantity));
      trackEvent(Number(fid), "sold-item", {
        itemId: itemId,
        quantity: quantity,
      });
      const updatedQuests = await calculateUserQuestsProgress(
        Number(fid),
        "sell",
        Number(itemId),
        Number(quantity)
      );
      return NextResponse.json(
        { message: "Item sold", quests: updatedQuests },
        { status: 200 }
      );
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
};
