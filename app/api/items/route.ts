import { getUserItems } from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getUserItems(Number(fid));
  return NextResponse.json(items);
};
