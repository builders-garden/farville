import { getItemById } from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { action, itemId, quantity } = await req.json();
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const item = await getItemById(Number(itemId));
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  switch (action) {
    case "buy":
      // TODO: Implement buy logic
      // TODO: Check if user has enough funds
      // TODO: Check if item is already owned
      // TODO: If already owned, increase quantity
      // TODO: If not owned, create new item
      // TODO: Decrease user funds
    case "sell":
      // TODO: Implement sell logic
      // TODO: Check if user has enough items
      // TODO: Check if item is owned
      // TODO: If owned, decrease quantity
      // TODO: If quantity is 0, delete item
      // TODO: Increase user funds
  }
};
