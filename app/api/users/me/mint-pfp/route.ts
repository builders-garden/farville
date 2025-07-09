import { NextRequest, NextResponse } from "next/server";
import { PFP_NFT_BASE_ADDRESS } from "@/lib/contracts/constants";

import { z } from "zod";
import { publicClient } from "@/lib/viem";
import { PFP_NFT_ABI } from "@/lib/contracts/pfp-nft/abi";
import { CollectibleStatus } from "@/lib/types/game";
import { updateUserCollectible } from "@/lib/prisma/queries";
import { notifyCollectibleMint } from "@/lib/farville-service";

const requestSchema = z.object({
  txHash: z.string().min(1),
  collectibleId: z.number().min(1),
});

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { txHash, collectibleId } = requestBody.data;

  try {
    // check if the user has minted his nft
    // get viem public client from Wagmi config
    const nftMinted = await publicClient.readContract({
      abi: PFP_NFT_ABI,
      address: PFP_NFT_BASE_ADDRESS,
      functionName: "minted",
      args: [BigInt(fid)],
    });

    if (nftMinted) {
      const res = await updateUserCollectible(Number(fid), collectibleId, {
        txHash,
        status: CollectibleStatus.Minted,
      });

      // Send Discord notification (non-blocking)
      notifyCollectibleMint({
        fid: Number(fid),
        collectibleId,
        txHash,
        imageUrl: res.mintedImageUrl || undefined,
      }).catch((error) => {
        // Log error but don't fail the main request
        console.error("Failed to send Discord notification:", error);
      });

      return NextResponse.json({
        success: true,
        data: {
          userHasCollectible: res,
        },
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: "User has not minted his nft",
      },
      { status: 500 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
};
