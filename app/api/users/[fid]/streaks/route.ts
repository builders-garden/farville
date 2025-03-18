import { getUserStreaks } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { fid: stringFid } = await params;
    const fid = parseInt(stringFid);
    if (isNaN(fid)) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }
    const streaks = await getUserStreaks(fid);
    return NextResponse.json(streaks);
  } catch (error) {
    console.error("Error fetching user streaks:", error);
    return NextResponse.json(
      { error: "Failed to fetch user streaks" },
      { status: 500 }
    );
  }
};
