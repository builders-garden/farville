import { NextRequest, NextResponse } from "next/server";
import { buyItem, sellItem } from "./utils";

export const POST = async (req: NextRequest) => {
  const { action, itemId, quantity } = await req.json();
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  switch (action) {
    case "buy":
      await buyItem(Number(fid), Number(itemId), Number(quantity));
      return NextResponse.json({ message: "Item bought" }, { status: 200 });
    case "sell":
      await sellItem(Number(fid), Number(itemId), Number(quantity));
      return NextResponse.json({ message: "Item sold" }, { status: 200 });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
};
