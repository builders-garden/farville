import { getUserItems } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { validMode } from "@/lib/validators/mode";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const category = req.nextUrl.searchParams.get("category") || undefined;
  const mode = req.nextUrl.searchParams.get("mode");
  if (mode && !validMode(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const items = await getUserItems(Number(fid), mode as Mode, category);
  return NextResponse.json(items);
};
