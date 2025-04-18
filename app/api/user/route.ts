import { getUserByMode } from "@/lib/prisma/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = Number(searchParams.get("fid"));

    if (!fid || isNaN(fid)) {
      return NextResponse.json({ error: "Invalid farmer ID" }, { status: 400 });
    }

    const farmer = await getUserByMode(fid);

    if (!farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "ok",
      data: farmer,
    });
  } catch (error) {
    console.error("Error fetching farmer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
