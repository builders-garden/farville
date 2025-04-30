import { NextRequest, NextResponse } from "next/server";
import { Mode } from "@/lib/types/game";
import {
  getUserHasVouchersBySlug,
  getVoucherBySlug,
} from "@/lib/prisma/queries";
import { modeAvailableForUser } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const fid = request.headers.get("x-user-fid");
    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    // TODO: remove mode !== Mode.Farcon once farcon is over
    if (
      !mode ||
      !Object.values(Mode).includes(mode as Mode) ||
      mode !== Mode.Farcon
    ) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const { slug } = await params;
    const voucher = await getVoucherBySlug(slug);
    if (!voucher) {
      return NextResponse.json(
        { error: "Invalid voucher slug" },
        { status: 400 }
      );
    }

    // check user fid is valid for mode voucher
    const isFarconUser = modeAvailableForUser(mode as Mode, Number(fid));
    console.log("isFarconUser", isFarconUser);
    if (!isFarconUser) {
      return NextResponse.json(
        { error: "User is not in farcon" },
        { status: 401 }
      );
    }

    const userVouchers = await getUserHasVouchersBySlug(
      Number(fid),
      mode as Mode
    );

    // get number of vouchers
    const totalClaimableVouchers = userVouchers
      ? userVouchers.voucher.quantity
      : voucher.quantity;

    // get number of vouchers claimed
    const userVouchersClaimed = userVouchers ? userVouchers.claimedAmount : 0;

    // get number of vouchers available to claim
    const availableVouchers = totalClaimableVouchers - userVouchersClaimed;

    return NextResponse.json({
      totalClaimableVouchers,
      userVouchersClaimed,
      availableVouchers,
    });
  } catch (error) {
    console.error("Error fetching user vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch user vouchers" },
      { status: 500 }
    );
  }
}
