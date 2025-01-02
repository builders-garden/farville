import { addReferral, getReferralsByFid } from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fid = searchParams.get("fid");

    if (!fid) {
      return NextResponse.json(
        { error: "Missing fid parameter" },
        { status: 400 }
      );
    }

    const referrals = await getReferralsByFid(parseInt(fid));
    return NextResponse.json({
      status: "ok",
      data: {
        ...referrals,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: "nok",
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

const referralSchema = z.object({
  referred: z.number().min(1),
  referrer: z.number().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedBody = referralSchema.parse(body);

    await addReferral(validatedBody.referrer, validatedBody.referred);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      {
        status: "nok",
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
