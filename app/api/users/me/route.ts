import { getUserByMode } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { validMode } from "@/lib/validators/mode";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fid = request.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = request.nextUrl.searchParams.get("mode") || undefined;
  if (mode && !validMode(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  const user = await getUserByMode(Number(fid), mode as Mode | undefined);
  return NextResponse.json(user);
}
