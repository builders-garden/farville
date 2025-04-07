import { NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { encodePacked, keccak256 } from "viem";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const { recipient, tokenId, tokenIdURI } = await request.json();

    if (!recipient || !tokenId || !tokenIdURI) {
      return NextResponse.json(
        { error: "Recipient, tokenId, and tokenIdURI are required" },
        { status: 400 }
      );
    }

    // Get the private key from environment variables
    const privateKey = env.SIGNER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Signer private key not configured");
    }

    // Create an account from the private key
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const messageHash = keccak256(
      encodePacked(
        ["address", "uint256", "string"],
        [recipient, tokenId, tokenIdURI]
      )
    );

    // Sign the hash directly as a hex string
    console.log("signing message");
    const signature = await account.signMessage({
      message: { raw: messageHash },
    });

    // Return the signature and the signer's address for verification
    console.log("returning signature");
    return NextResponse.json({
      success: true,
      data: {
        signature: signature,
        signerAddress: account.address,
      },
    });
  } catch (error) {
    console.error("Error signing message:", error);
    return NextResponse.json(
      { error: "Failed to sign message" },
      { status: 500 }
    );
  }
}
