import { getUserFrosts } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const frosts = await getUserFrosts(Number(fid));
  return NextResponse.json(frosts);
};
