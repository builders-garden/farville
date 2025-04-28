import { getUserByMode } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  const fid = (await params).fid;
  const user = await getUserByMode(Number(fid), Mode.Classic);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}
