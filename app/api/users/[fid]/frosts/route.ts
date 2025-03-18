import { getUserFrosts } from "@/lib/prisma/queries";
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
    const frosts = await getUserFrosts(fid);
    return NextResponse.json(frosts);
  } catch (error) {
    console.error("Error fetching user frosts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user frosts" },
      { status: 500 }
    );
  }
};
