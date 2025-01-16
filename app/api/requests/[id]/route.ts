import { getRequestById } from "@/supabase/queries";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const request = await getRequestById(Number(id));
  return NextResponse.json(request);
};
