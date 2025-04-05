/**
 * Get the farcaster manifest for the frame, generate yours from Warpcast Mobile
 *  On your phone to Settings > Developer > Domains > insert website hostname > Generate domain manifest
 * @returns The farcaster manifest for the frame
 */
export async function getFarcasterManifest() {
  let frameName = "FarVille";
  const appUrl = process.env.NEXT_PUBLIC_URL!;
  if (appUrl.includes("localhost")) {
    frameName += " Local";
  } else if (appUrl.includes("ngrok")) {
    frameName += " NGROK";
  } else if (appUrl.includes("dev.betttr.xyz")) {
    frameName += " Dev";
  }
  return {
    accountAssociation: {
      header: process.env.NEXT_PUBLIC_FARCASTER_HEADER!,
      payload: process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD!,
      signature: process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE!,
    },
    frame: {
      version: "1",
      name: frameName,
      iconUrl: `${appUrl}/images/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/images/feed.png`,
      buttonTitle: `Play ${frameName} 🧑‍🌾`,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#ffffff",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };
}
