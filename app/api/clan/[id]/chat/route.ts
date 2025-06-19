import { NextRequest, NextResponse } from "next/server";
import {
  createClanChatMessage,
  getClanChatMessages,
  deleteClanChatMessage,
} from "@/lib/prisma/queries";
import { getClanByFid } from "@/lib/prisma/queries/clan-membership";
import z from "zod";

const sendMessageSchema = z.object({
  message: z.string().min(1).max(500, "Message must be 500 characters or less"),
});

const getMessagesSchema = z.object({
  limit: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return 20;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 20 : Math.min(Math.max(parsed, 1), 100); // Clamp between 1-100
    }),
  cursor: z.string().optional().nullable(),
});

const deleteMessageSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
});

// Get clan chat messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clanId } = await params;
    const { searchParams } = new URL(req.url);

    console.log("GET /api/clan/[id]/chat - clanId:", clanId);
    console.log("Query params:", Object.fromEntries(searchParams.entries()));

    const fid = req.headers.get("x-user-fid");

    console.log("Fid from headers:", fid);

    if (!fid) {
      console.log("No fid in headers");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the clan
    const userClan = await getClanByFid(parseInt(fid));
    if (!userClan || userClan.clanId !== clanId) {
      return NextResponse.json(
        { error: "You must be a member of this clan to view chat" },
        { status: 403 }
      );
    }

    const queryResult = getMessagesSchema.safeParse({
      limit: searchParams.get("limit"),
      cursor: searchParams.get("cursor"),
    });

    if (!queryResult.success) {
      console.error("Query validation failed:", queryResult.error);
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { limit, cursor } = queryResult.data;
    const messages = await getClanChatMessages(
      clanId,
      limit,
      cursor ?? undefined
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching clan chat messages:", error);

    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to fetch messages",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Send a new chat message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clanId } = await params;
    const fid = req.headers.get("x-user-fid");

    console.log("fid:", fid);

    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the clan
    const userClan = await getClanByFid(parseInt(fid));
    if (!userClan || userClan.clanId !== clanId) {
      return NextResponse.json(
        { error: "You must be a member of this clan to send messages" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = sendMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { message } = parseResult.data;

    // Create the chat message
    const chatMessage = await createClanChatMessage(
      clanId,
      parseInt(fid),
      message
    );

    // TODO: Emit the message to all clan members via socket when server-side socket is set up
    // This would typically be done through a message queue or server-side socket.io instance

    return NextResponse.json(chatMessage);
  } catch (error) {
    console.error("Error sending clan chat message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// Delete a chat message
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clanId } = await params;
    const fid = req.headers.get("x-user-fid");

    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the clan
    const userClan = await getClanByFid(parseInt(fid));
    if (!userClan || userClan.clanId !== clanId) {
      return NextResponse.json(
        { error: "You must be a member of this clan" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = deleteMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid message ID" },
        { status: 400 }
      );
    }

    const { messageId } = parseResult.data;

    await deleteClanChatMessage(messageId, parseInt(fid));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting clan chat message:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete message",
      },
      { status: 500 }
    );
  }
}
