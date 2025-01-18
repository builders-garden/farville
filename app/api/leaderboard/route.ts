import { getUsersByXp } from "@/supabase/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetFid = searchParams.get("targetFid");
  try {
    const users = await getUsersByXp(10, targetFid ? Number(targetFid) : undefined);
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
