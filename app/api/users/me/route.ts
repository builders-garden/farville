import { getUser } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fid = request.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser(Number(fid));
  return NextResponse.json(user);
}
