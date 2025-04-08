import { NextResponse } from "next/server";
import { pinata } from "@/lib/pinata";
import { updateUserCollectible } from "@/supabase/queries";
import { CollectibleStatus } from "@/types/game";

export async function POST(request: Request) {
  try {
    const { imageUrl, fid, collectibleId } = await request.json();
    if (!imageUrl || !fid || !collectibleId) {
      return NextResponse.json(
        { success: false, error: "Invalid pinata arguments" },
        { status: 400 }
      );
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());

    // Create Blob and File objects
    const blob = new Blob([buffer], { type: "image/png" });
    const file = new File([blob], `image-farmer-${fid}.png`, {
      type: "image/png",
    });

    // Upload to Pinata using their SDK
    const imageUploadData = await pinata.upload.file(file);
    const imageCID = imageUploadData.IpfsHash;
    const imageMetadataUrl = `https://gateway.pinata.cloud/ipfs/${imageUploadData.IpfsHash}`;

    //Upload metadata to Pinata
    const metadataFile = new File(
      [
        JSON.stringify({
          name: `Farville Farmer #${fid}`,
          description:
            "This exclusive Farville Farmer is a unique symbol of your membership to the Farville community.",
          image: `ipfs://${imageCID}`,
          external_url: `https://farville.farm`,
        }),
      ],
      `metadata-farmer-${fid}.json`,
      {
        type: "application/json",
      }
    );

    //Upload metadata to Pinata
    const metadataUploadData = await pinata.upload.file(metadataFile);
    const metadataCID = `ipfs://${metadataUploadData.IpfsHash}`;
    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

    // save metadataUrl to db
    console.log("saving metadataUrl to db", metadataUrl);
    const res = await updateUserCollectible(fid, collectibleId, {
      mintedMetadataUrl: metadataUrl,
      mintedImageUrl: imageMetadataUrl,
      status: CollectibleStatus.Uploaded,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          imageUrl,
          imageMetadataUrl,
          imageCID,
          metadataUrl,
          metadataCID,
          userHasCollectible: res,
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
