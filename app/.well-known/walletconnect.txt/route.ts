import { env } from "@/lib/env";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // go on https://cloud.reown.com and get the walletconnect verification code for the domain
    return NextResponse.json(env.NEXT_PUBLIC_REOWN_DOMAIN_VERIFICATION_CODE);
  } catch (error) {
    console.error("Error generating manifest:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
