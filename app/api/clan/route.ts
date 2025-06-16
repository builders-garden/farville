import { NextRequest, NextResponse } from "next/server";
import {
  createClan,
  getClanById,
  getClans,
  updateClan,
} from "@/lib/prisma/queries";
import { ClanRole } from "@/lib/types/game";
import { prisma } from "@/lib/prisma/client";
import { fetchDaimoPayment } from "@/lib/daimo";
import {
  BG_MULTISIG_ADDRESS,
  BASE_USDC_ADDRESS,
} from "@/lib/contracts/constants";
import { base } from "viem/chains";
import z from "zod";
import { CLAN_CREATION_COST_USD } from "@/lib/game-constants";
import { uploadImage } from "@/lib/imagekit";

// Basic payment validation - checks if txHash exists and follows expected format
// In a production environment, you might want to verify the transaction on-chain
const validatePaymentTxHash = (txHash: string): boolean => {
  // Check if it's a valid transaction hash format (66 characters, starts with 0x)
  const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
  return txHashRegex.test(txHash);
};

// Comprehensive payment validation using Daimo API
const validateClanPayment = async (
  paymentId: string
): Promise<{
  isValid: boolean;
  error?: string;
  txHash?: string;
}> => {
  try {
    // Fetch payment details from Daimo
    const daimoPayment = await fetchDaimoPayment(paymentId);

    console.log("Daimo payment data:", JSON.stringify(daimoPayment, null, 2));

    // Check payment status
    if (daimoPayment.status !== "payment_completed") {
      return {
        isValid: false,
        error: `Payment status is ${daimoPayment.status}, expected payment_completed`,
      };
    }

    // Check payment amount
    const paymentAmount = Number(daimoPayment.display.paymentValue);
    if (paymentAmount !== CLAN_CREATION_COST_USD) {
      return {
        isValid: false,
        error: `Payment amount is $${paymentAmount}, expected $${CLAN_CREATION_COST_USD}`,
      };
    }

    // Check destination address
    if (
      daimoPayment.destination.destinationAddress.toLowerCase() !==
      BG_MULTISIG_ADDRESS.toLowerCase()
    ) {
      return {
        isValid: false,
        error: `Payment sent to wrong address: ${daimoPayment.destination.destinationAddress}`,
      };
    }

    // Check token address (should be USDC)
    if (
      daimoPayment.destination.tokenAddress.toLowerCase() !==
      BASE_USDC_ADDRESS.toLowerCase()
    ) {
      return {
        isValid: false,
        error: `Payment made with wrong token: ${daimoPayment.destination.tokenAddress}`,
      };
    }

    // Check chain ID (should be Base)
    if (Number(daimoPayment.destination.chainId) !== base.id) {
      return {
        isValid: false,
        error: `Payment made on wrong chain: ${daimoPayment.destination.chainId}`,
      };
    }

    return {
      isValid: true,
      txHash: daimoPayment.source.txHash,
    };
  } catch (error) {
    console.error("Error validating clan payment:", error);
    return {
      isValid: false,
      error: `Failed to validate payment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const strToSearch = searchParams.get("search") || "";
    const isPublicParam = searchParams.get("isPublic");
    const isPublic =
      isPublicParam === null ? undefined : isPublicParam === "true";

    const clans = await getClans({
      strToSearch,
      isPublic,
      includeMembers: true,
    });
    return NextResponse.json(clans);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

const fileSizeLimit = 3 * 1024 * 1024; // 3MB

// Image Schema
const IMAGE_SCHEMA = z
  .instanceof(File)
  .refine(
    (file) =>
      [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/svg+xml",
        "image/gif",
        "image/webp",
      ].includes(file.type),
    { message: "Invalid image file type" }
  )
  .refine((file) => file.size <= fileSizeLimit, {
    message: "File size should not exceed 5MB",
  });

const createClanSchema = z.object({
  name: z.string().min(3).max(50),
  motto: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
  txHash: z.string().min(1, "Payment transaction hash is required").max(66),
  imageFile: IMAGE_SCHEMA.optional(),
  requiredLevel: z.number().int().min(1).optional(),
  paymentId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const fid = req.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let parsedData;
    let imageFile: File | undefined;
    let clanImage: string | undefined;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.startsWith("multipart/form-data")) {
      const form = await req.formData();
      // Convert FormData to plain object for zod
      const data: Record<string, unknown> = {};
      form.forEach((value, key) => {
        if (value instanceof File && value.size > 0) {
          data[key] = value;
        } else {
          // Try to parse booleans and numbers
          if (key === "isPublic") {
            data[key] = value === "true";
          } else if (key === "requiredLevel") {
            data[key] = value ? Number(value) : undefined;
          } else {
            data[key] = value;
          }
        }
      });

      console.log("Form Data:", data);
      parsedData = createClanSchema.parse(data);
      imageFile = data.imageFile as File | undefined;
    } else {
      const body = await req.json();
      parsedData = createClanSchema.parse(body);
      imageFile = parsedData.imageFile;
    }

    clanImage = parsedData.imageUrl ? parsedData.imageUrl : undefined;
    if (imageFile) {
      clanImage = await uploadImage(imageFile, `clan-${Date.now()}`);
    }

    console.log("Parsed Data:", parsedData);
    console.log("Clan Image URL:", clanImage);

    // Basic transaction hash format validation
    if (!validatePaymentTxHash(parsedData.txHash)) {
      return NextResponse.json(
        { error: "Invalid payment transaction hash format" },
        { status: 400 }
      );
    }

    // Check if transaction hash is already used by another clan
    const existingClanWithTxHash = await prisma.clan.findFirst({
      where: { txHash: parsedData.txHash },
    });

    if (existingClanWithTxHash) {
      return NextResponse.json(
        { error: "Payment has already been used for clan creation" },
        { status: 400 }
      );
    }

    // Comprehensive payment validation using Daimo API
    const paymentValidation = await validateClanPayment(parsedData.paymentId);
    if (!paymentValidation.isValid) {
      return NextResponse.json(
        { error: `Payment validation failed: ${paymentValidation.error}` },
        { status: 400 }
      );
    }

    // Create the clan with the validated payment transaction hash
    const clan = await createClan({
      ...parsedData,
      txHash: paymentValidation.txHash || parsedData.txHash,
      imageUrl: clanImage,
      createdBy: Number(fid),
      leaderFid: Number(fid),
    });

    return NextResponse.json(clan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

const updateClanSchema = z.object({
  clanId: z.string().min(1, "Clan ID is required"),
  motto: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  imageUrl: z.string().url().nullish(),
  requiredLevel: z.number().int().min(2).max(20).nullish(),
});

export async function PATCH(req: NextRequest) {
  try {
    const fid = req.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let parsedData;
    let imageFile: File | undefined;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.startsWith("multipart/form-data")) {
      const form = await req.formData();
      const data: Record<string, unknown> = {};
      form.forEach((value, key) => {
        if (value instanceof File && value.size > 0) {
          data[key] = value;
        } else {
          if (key === "isPublic") {
            data[key] = value === "true";
          } else if (key === "requiredLevel") {
            data[key] = value ? Number(value) : undefined;
          } else {
            data[key] = value;
          }
        }
      });
      parsedData = updateClanSchema.parse(data);
      imageFile = data.imageFile as File | undefined;
    } else {
      const body = await req.json();
      parsedData = updateClanSchema.parse(body);
    }

    // Get the clan to check permissions
    const clan = await getClanById(parsedData.clanId, { includeMembers: true });
    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }
    const userMembership = clan.members?.find(
      (member) => member.fid === Number(fid)
    );
    if (!userMembership) {
      return NextResponse.json(
        { error: "You are not a member of this clan" },
        { status: 403 }
      );
    }
    if (
      userMembership.role !== ClanRole.Leader &&
      userMembership.role !== ClanRole.Officer
    ) {
      return NextResponse.json(
        { error: "You don't have permission to edit this clan" },
        { status: 403 }
      );
    }

    // Update the clan with non-null values
    const updateData: {
      motto?: string;
      isPublic?: boolean;
      imageUrl?: string | null;
      requiredLevel?: number | null;
    } = {};

    if (parsedData.motto !== undefined) {
      updateData.motto = parsedData.motto;
    }
    if (parsedData.isPublic !== undefined) {
      updateData.isPublic = parsedData.isPublic;
    }
    if (imageFile) {
      // If a new image file is uploaded, upload and use its URL
      updateData.imageUrl = await uploadImage(imageFile, `clan-${Date.now()}`);
    } else if (parsedData.imageUrl !== undefined) {
      updateData.imageUrl = parsedData.imageUrl || null;
    }
    if (parsedData.requiredLevel !== undefined) {
      updateData.requiredLevel = parsedData.requiredLevel;
    }

    const updatedClan = await updateClan(parsedData.clanId, updateData);
    return NextResponse.json(updatedClan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
