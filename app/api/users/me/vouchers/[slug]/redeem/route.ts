import { NextRequest, NextResponse } from "next/server";
import { Mode } from "@/lib/types/game";
import {
  addUserItem,
  addUserVoucher,
  getUserHasVouchersBySlug,
  getVoucherBySlug,
} from "@/lib/prisma/queries";
import { modeAvailableForUser } from "@/lib/utils";
import { z } from "zod";

const requestSchema = z.object({
  mode: z.nativeEnum(Mode),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const fid = request.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestJson = await request.json();
    const requestBody = requestSchema.safeParse(requestJson);

    if (requestBody.success === false) {
      return NextResponse.json(
        { error: requestBody.error.errors },
        { status: 400 }
      );
    }

    const { mode } = requestBody.data;

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
    if (!isFarconUser) {
      return NextResponse.json(
        { error: "User is not in farcon" },
        { status: 401 }
      );
    }

    // get user vouchers
    const userVouchers = await getUserHasVouchersBySlug(
      Number(fid),
      mode as Mode
    );

    // get number of vouchers claimed
    const userVouchersClaimed = userVouchers ? userVouchers.claimedAmount : 0;

    // get number of vouchers available to claim
    const availableVouchers = voucher.quantity - userVouchersClaimed;

    if (availableVouchers <= 0) {
      return NextResponse.json(
        { error: "No vouchers available to claim" },
        { status: 400 }
      );
    }

    // save user voucher to db
    await addUserVoucher(Number(fid), voucher.id);

    // add user item
    await addUserItem(Number(fid), voucher.itemId, voucher.quantity, mode);

    return NextResponse.json({
      success: true,
      message: `Voucher ${voucher.name} redeemed successfully`,
    });
  } catch (error) {
    console.error("Error redeeming voucher:", error);
    return NextResponse.json(
      { error: "Failed to redeem voucher" },
      { status: 500 }
    );
  }
}
