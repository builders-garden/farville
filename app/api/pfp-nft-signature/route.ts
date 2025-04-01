import { NextResponse } from "next/server";
import { Wallet } from "ethers";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get the private key from environment variables
    const privateKey = process.env.SIGNER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Signer private key not configured");
    }

    // Create a wallet instance
    const wallet = new Wallet(privateKey);

    // Sign the message
    const signature = await wallet.signMessage(message);

    // Return the signature and the signer's address for verification
    return NextResponse.json({
      signature,
      signerAddress: wallet.address,
      message,
    });
  } catch (error) {
    console.error("Error signing message:", error);
    return NextResponse.json(
      { error: "Failed to sign message" },
      { status: 500 }
    );
  }
}
