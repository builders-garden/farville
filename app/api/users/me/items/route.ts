import { getUserItems } from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("GET /api/users/me/items");
  const category = req.nextUrl.searchParams.get("category") || undefined;
  const items = await getUserItems(Number(fid), category);
  console.log("items", items);
  return NextResponse.json(items);
};
