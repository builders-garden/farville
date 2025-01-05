import { getUsersByXp } from "@/supabase/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await getUsersByXp(10);
  return NextResponse.json(users);
}
