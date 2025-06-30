import { getUserDonationsOfToday } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { userCanDonate } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const donator = searchParams.get("donator");
  const receiver = searchParams.get("receiver");
  const mode = searchParams.get("mode") as Mode;

  if (!donator || !receiver || !mode) {
    return NextResponse.json(
      { error: "Missing donator or receiver parameter" },
      { status: 400 }
    );
  }

  const todayDonations = await getUserDonationsOfToday(Number(donator), mode);

  const { canDonateToReceiver, canDonateToAnotherUser, errorMessage } =
    userCanDonate(todayDonations, Number(receiver), mode);

  return NextResponse.json(
    {
      todayDonations,
      canDonateToReceiver,
      canDonateToAnotherUser,
      errorMessage,
    },
    { status: 200 }
  );
};
