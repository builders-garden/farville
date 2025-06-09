import { env } from "@/lib/env";
import {
  ImpactOccurredType,
  NotificationOccurredType,
} from "@farcaster/frame-core/dist/actions/Haptics";
import sdk from "@farcaster/frame-sdk";

/**
 * Get the farcaster manifest for the frame, generate yours from Warpcast Mobile
 *  On your phone to Settings > Developer > Domains > insert website hostname > Generate domain manifest
 * @returns The farcaster manifest for the frame
 */
export async function getFarcasterManifest() {
  let frameName = "Farville";
  let noindex = false;
  const appUrl = env.NEXT_PUBLIC_URL;
  if (appUrl.includes("localhost")) {
    frameName += " Local";
    noindex = true;
  } else if (appUrl.includes("ngrok")) {
    frameName += " NGROK";
    noindex = true;
  } else if (appUrl.includes("dev.farville.farm")) {
    frameName += " Dev";
    noindex = true;
  } else if (appUrl.includes("coolify")) {
    frameName += " Coolify";
    noindex = true;
  }
  return {
    accountAssociation: {
      header: env.NEXT_PUBLIC_FARCASTER_HEADER,
      payload: env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
      signature: env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
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
      // Metadata https://github.com/farcasterxyz/miniapps/discussions/191
      subtitle: "Farm daily, earn weekly", // 30 characters, no emojis or special characters, short description under app name
      description: "Plant, harvest, compete and earn", // 170 characters, no emojis or special characters, promotional message displayed on Mini App Page
      primaryCategory: "games",
      tags: ["farm", "potato", "game"], // up to 5 tags, filtering/search tags
      tagline: "Farm daily, earn weekly", // 30 characters, marketing tagline should be punchy and descriptive
      ogTitle: `Play ${frameName}`, // 30 characters, app name + short tag, Title case, no emojis
      ogDescription: "Plant, harvest, compete and earn", // 100 characters, summarize core benefits in 1-2 lines
      screenshotUrls: [
        // 1284 x 2778, visual previews of the app, max 3 screenshots
        `${env.NEXT_PUBLIC_URL}/images/screenshots/1.png`,
        `${env.NEXT_PUBLIC_URL}/images/screenshots/2.png`,
        `${env.NEXT_PUBLIC_URL}/images/screenshots/3.png`,
      ],
      heroImageUrl: `${env.NEXT_PUBLIC_URL}/images/hero.jpg`, // 1200 x 630px (1.91:1), promotional display image on top of the mini app store
      ogImageUrl: `${env.NEXT_PUBLIC_URL}/images/hero.jpg`, // 1200 x 630px (1.91:1), promotional image, same as app hero image
      noindex: noindex,
    },
  };
}

export const hapticsImpactOccurred = async (type: ImpactOccurredType) => {
  try {
    await sdk.haptics.impactOccurred(type);
  } catch {}
};

export const hapticsNotificationOccurred = async (
  type: NotificationOccurredType
) => {
  try {
    await sdk.haptics.notificationOccurred(type);
  } catch {}
};
