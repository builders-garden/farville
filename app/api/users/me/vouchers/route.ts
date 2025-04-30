import { NextRequest, NextResponse } from "next/server";
import { Mode } from "@/lib/types/game";
import { getUserHasVouchers } from "@/lib/prisma/queries";
import { modeAvailableForUser } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const fid = request.headers.get("x-user-fid");
    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeToday = searchParams.get("activeToday");
    const mode = searchParams.get("mode");

    // TODO: remove mode !== Mode.Farcon once farcon is over
    if (
      !mode ||
      !Object.values(Mode).includes(mode as Mode) ||
      mode !== Mode.Farcon
    ) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
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

    const vouchers = await getUserHasVouchers(
      Number(fid),
      mode as Mode,
      activeToday === "true"
    );

    return NextResponse.json(vouchers);
  } catch (error) {
    console.error("Error fetching user vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch user vouchers" },
      { status: 500 }
    );
  }
}
