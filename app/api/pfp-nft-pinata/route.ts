import { NextResponse } from "next/server";
import { pinata } from "@/lib/pinata";

export async function POST(request: Request) {
  try {
    const { imageUrl, fid } = await request.json();
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Invalid pinata arguments" },
        { status: 400 }
      );
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());

    // Create Blob and File objects
    const blob = new Blob([buffer], { type: 'image/png' });
    const file = new File([blob], `${fid}.png`, { type: 'image/png' });

    // Upload to Pinata using their SDK
    const imageUploadData = await pinata.upload.file(file);
    const imageCID = imageUploadData.IpfsHash;
    const imageMetadataUrl = `https://gateway.pinata.cloud/ipfs/${imageUploadData.IpfsHash}`;

    //Upload metadata to Pinata
    const metadataFile = new File(
      [
        JSON.stringify({
          name: "Farville Avatar",
          description: "This exclusive Farville Avatar is a unique symbol of your membership to the Farville community.",
          image: `ipfs://${imageCID}`,
          external_url: `https://farville.farm`,
        }),
      ],
      "metadata.json",
      {
        type: "application/json",
      }
    );

    //Upload metadata to Pinata
    const metadataUploadData = await pinata.upload.file(metadataFile);
    const metadataCID = `ipfs://${metadataUploadData.IpfsHash}`;
    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          imageUrl,
          imageMetadataUrl,
          imageCID,
          metadataUrl,
          metadataCID,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
  
}
