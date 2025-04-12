import { getUserDonationsOfToday } from "@/lib/prisma/queries";
import { userCanDonate } from "@/lib/utils";
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

  const todayDonations = await getUserDonationsOfToday(Number(donator));

  const { canDonateToReceiver, canDonateToAnotherUser } = userCanDonate(
    todayDonations,
    Number(receiver)
  );

  return NextResponse.json(
    {
      todayDonations,
      canDonateToReceiver,
      canDonateToAnotherUser,
    },
    { status: 200 }
  );
};
