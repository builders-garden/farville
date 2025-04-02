import { NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";

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
    const privateKey = process.env.SIGNER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Signer private key not configured");
    }

    // Create an account from the private key
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    // Create the message hash 
    const messageHash = await account.signMessage({
      message: {
        raw: recipient + tokenId + tokenIdURI,
      },
    });

    // Return the signature and the signer's address for verification
    return NextResponse.json({
      signature: messageHash,
      signerAddress: account.address,
    });
  } catch (error) {
    console.error("Error signing message:", error);
    return NextResponse.json(
      { error: "Failed to sign message" },
      { status: 500 }
    );
  }
}
