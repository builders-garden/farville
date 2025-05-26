import { NextRequest } from "next/server";

export async function getNextServerIp(request: NextRequest) {
  const headersList = request.headers;
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return undefined; // or '0.0.0.0', depends
}
