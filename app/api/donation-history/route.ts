import { getUserDonationByReceiver } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const donator = searchParams.get("donator");
  const receiver = searchParams.get("receiver");

  if (!donator || !receiver) {
    return NextResponse.json(
      { error: "Missing donator or receiver parameter" },
      { status: 400 }
    );
  }

  const donation = await getUserDonationByReceiver(
    Number(donator),
    Number(receiver)
  );
  return NextResponse.json(donation);
};
