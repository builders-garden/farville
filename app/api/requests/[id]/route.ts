import { getRequestById } from "@/lib/prisma/queries";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const request = await getRequestById(id);
  return NextResponse.json(request);
};
