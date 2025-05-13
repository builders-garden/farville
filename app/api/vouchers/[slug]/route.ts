import { getVoucherBySlug } from "@/lib/prisma/queries";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  const voucher = await getVoucherBySlug(slug);

  return NextResponse.json(voucher);
};
