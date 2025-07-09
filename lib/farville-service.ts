import axios from "axios";
import { env } from "./env";

/**
 * Sends a notification to the Farville service for collectible minting
 */
export async function notifyCollectibleMint({
  fid,
  collectibleId,
  txHash,
  imageUrl,
}: {
  fid: number;
  collectibleId: number;
  txHash: string;
  imageUrl?: string;
}): Promise<boolean> {
  try {
    const response = await axios.post(
      `${env.FARVILLE_SERVICE_URL}/api/collectible/mint`,
      {
        fid,
        collectibleId,
        txHash,
        imageUrl,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
        },
      }
    );

    console.log(
      "Collectible mint notification sent successfully:",
      response.data
    );
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Failed to send collectible mint notification:",
        error.response?.status,
        error.response?.statusText,
        error.response?.data
      );
    } else {
      console.error("Error sending collectible mint notification:", error);
    }
    return false;
  }
}
