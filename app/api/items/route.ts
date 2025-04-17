import { getItems } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const category = req.nextUrl.searchParams.get("category") || undefined;
  const items = await getItems(category);
  return NextResponse.json(items);
};
