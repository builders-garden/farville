import { updateUser } from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";
import { NFT_OG_BASE_ADDRESS } from "@/lib/contracts/constants";
import { NFT_OG_BASE_ABI } from "@/lib/contracts/og-nft/abi";
import { z } from "zod";
import { fetchUser } from "@/lib/neynar";
import { publicClient } from "@/lib/viem";

const requestSchema = z.object({
  tokenId: z.number().min(1),
});

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { tokenId } = requestBody.data;

  try {
    // check if the user has minted an OG NFT
    // get viem public client from Wagmi config
    const tokenOwnerAddress = await publicClient.readContract({
      abi: NFT_OG_BASE_ABI,
      address: NFT_OG_BASE_ADDRESS,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });

    const farcasterUserData = await fetchUser(fid);

    // check if tokenOwnerAddress is inside the farcasterUserData.verifications array
    const isOgUser = farcasterUserData.verifications.some(
      (verifiedAddress) =>
        verifiedAddress.toLowerCase() === tokenOwnerAddress.toLowerCase()
    );

    // if yes, update the user mintedOG to true
    await updateUser(Number(fid), { mintedOG: isOgUser });

    return NextResponse.json({
      success: true,
      user: { fid, mintedOG: isOgUser },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
};
