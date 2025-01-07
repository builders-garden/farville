import { getUserNotificationDetails } from "@/supabase/queries";
import {
  SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/frame-sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import * as jose from "jose";

const requestSchema = z.object({
  fid: z.number(),
  title: z.string(),
  text: z.string(),
});

export async function POST(req: NextRequest) {
  // validate the request to be sure it comes from UpStash
  // UpStash sends a req with a JWT inside the Authorization header that we can verify
  const upstashSignature = req.headers.get("Upstash-Signature");

  // verify the signature
  if (!upstashSignature) {
    console.log(
      `[QSTASH-${new Date().toISOString()}-send-notification]`,
      "No Upstash signature provided"
    );
    return Response.json(
      { success: false, error: "No Upstash signature provided" },
      { status: 401 }
    );
  }

  const verificationResult = await jose.jwtVerify(
    upstashSignature,
    new TextEncoder().encode(process.env.QSTASH_CURRENT_SIGNING_KEY),
    {
      issuer: "Upstash",
      subject:
        "https://f9c5-93-71-129-185.ngrok-free.app/api/send-notification",
    }
  );

  // if the verification fails, return an error
  if (!verificationResult) {
    console.log(
      `[QSTASH-${new Date().toISOString()}-send-notification]`,
      "Invalid Upstash signature"
    );
    return Response.json(
      { success: false, error: "Invalid Upstash signature" },
      { status: 401 }
    );
  }

  console.log(
    `[QSTASH-${new Date().toISOString()}-send-notification]`,
    "Upstash signature verified"
  );

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return Response.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { fid, title, text } = requestBody.data;

  const notificationDetails = await getUserNotificationDetails(fid);

  const response = await fetch(notificationDetails.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId: crypto.randomUUID(),
      title: title,
      body: text,
      targetUrl: notificationDetails.url,
      tokens: [notificationDetails.token],
    } satisfies SendNotificationRequest),
  });

  const responseJson = await response.json();

  if (response.status === 200) {
    // Ensure correct response
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
    if (responseBody.success === false) {
      return Response.json(
        { success: false, errors: responseBody.error.errors },
        { status: 500 }
      );
    }

    // Fail when rate limited
    if (responseBody.data.result.rateLimitedTokens.length) {
      return Response.json(
        { success: false, error: "Rate limited" },
        { status: 429 }
      );
    }

    return Response.json({ success: true });
  } else {
    return Response.json(
      { success: false, error: responseJson },
      { status: 500 }
    );
  }
}
