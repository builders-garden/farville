import { getUserItems, updateUserItem } from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  rewards: z.array(
    z.object({
      itemId: z.number(),
      quantity: z.number(),
    })
  ),
});

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return Response.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { rewards } = requestBody.data;

  // TODO: validate items
  console.warn("missing rewards validation");

  const userItems = await getUserItems(Number(fid));

  // Update the items in the database
  for (const item of rewards) {
    const userItem = userItems.find((i) => i.itemId === item.itemId);

    await updateUserItem(
      Number(fid),
      item.itemId,
      userItem ? userItem.quantity + item.quantity : item.quantity
    );
  }

  return NextResponse.json({ message: "Item updated" }, { status: 200 });
};
