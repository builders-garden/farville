import { getUsersByXp } from "@/supabase/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await getUsersByXp(10);
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
