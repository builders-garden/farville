import { TitlesResponse, TitlesResponseState } from "@/lib/types/titles";
import axios from "axios";
import { TITLES_BASE_URL } from "../../utils";
import { env } from "@/lib/env";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getUserCollectibleByCollectibleId,
  updateUserCollectible,
} from "@/lib/prisma/queries";
import { CollectibleStatus } from "@/lib/types/game";
import { UserHasCollectible } from "@prisma/client";

const requestSchema = z.object({
  fid: z.number().int().positive("Fid must be a positive integer"),
  collectibleId: z
    .number()
    .int()
    .positive("Collectible ID must be a positive integer"),
});

export async function POST(
  request: Request,
  { params }: { params: { inference_id: string } }
) {
  try {
    const [body, resolvedParams] = await Promise.all([
      request.json(),
      Promise.resolve(params),
    ]);
    const parsedBody = requestSchema.parse(body);

    const { fid, collectibleId } = parsedBody;

    // check that the user has the collectible
    const userCollectible = await getUserCollectibleByCollectibleId(
      fid,
      collectibleId
    );

    if (
      !userCollectible ||
      userCollectible.status !== CollectibleStatus.Pending
    ) {
      return NextResponse.json(
        { error: "Invalid collectible or not in the correct state" },
        { status: 400 }
      );
    }

    const inferenceId = resolvedParams.inference_id;

    const titlesResponse = await axios<TitlesResponse>({
      url: `${TITLES_BASE_URL}/api/v1/inference/text-to-image/${inferenceId}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-TITLES-Key": env.TITLES_API_KEY,
      },
    });

    if (titlesResponse.status !== 200) {
      console.error("Error fetching Titles inference status:", titlesResponse);
      return NextResponse.json(
        { error: "Failed to fetch inference status" },
        { status: titlesResponse.status }
      );
    }

    const fieldsToUpdate: {
      status: CollectibleStatus;
      generatedImageUrls?: string[];
    } = { status: CollectibleStatus.Pending };
    switch (titlesResponse.data.state) {
      case TitlesResponseState.PROCESSED:
        fieldsToUpdate.status = CollectibleStatus.Generated;
        fieldsToUpdate.generatedImageUrls =
          titlesResponse.data.inference_output.images;
        break;
      case TitlesResponseState.FAILED:
        fieldsToUpdate.status = CollectibleStatus.Error;
        break;
      case TitlesResponseState.REQUESTED:
      case TitlesResponseState.RUNNING:
        break;
    }

    let updatedUserCollectible: UserHasCollectible | null = null;
    if (fieldsToUpdate.status !== CollectibleStatus.Pending) {
      updatedUserCollectible = await updateUserCollectible(
        fid,
        collectibleId,
        fieldsToUpdate
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        status: fieldsToUpdate.status,
        imageUrls: fieldsToUpdate.generatedImageUrls || [],
        userHasCollectible: updatedUserCollectible,
      },
    });
  } catch (error) {
    console.error("Error in Titles inference GET handler:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data || "Internal Server Error" },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
