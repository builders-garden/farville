import { getUserByMode } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fid: string; mode: Mode }> }
) {
  const fid = (await params).fid;
  const mode = (await params).mode;
  const user = await getUserByMode(Number(fid), mode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}
