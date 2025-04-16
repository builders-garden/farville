import { sendQuestsCalculation } from "@/app/api/grid-cells/utils";
import { NextRequest, NextResponse } from "next/server";
import { buyItem, sellItem } from "./utils";
import { z } from "zod";
import { MarketActionType } from "@/lib/types/game";

const requestSchema = z.object({
  action: z.nativeEnum(MarketActionType),
  itemId: z.number().min(1),
  quantity: z.number().min(1),
});

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { error: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { action, itemId, quantity } = requestBody.data;

  try {
    // buy and sell functions below checks user and item
    switch (action) {
      case MarketActionType.Buy:
        const buyResult = await buyItem(Number(fid), itemId, quantity);
        if (!buyResult.success) {
          return NextResponse.json(
            { error: buyResult.message },
            { status: buyResult.status }
          );
        }
        return NextResponse.json({ message: "Item bought" });
      case MarketActionType.Sell:
        const sellResult = await sellItem(Number(fid), itemId, quantity);
        if (!sellResult.success) {
          return NextResponse.json(
            { error: sellResult.message },
            { status: sellResult.status }
          );
        }
        await sendQuestsCalculation(Number(fid), "sell", itemId, quantity);
        return NextResponse.json({ message: "Item sold" });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
