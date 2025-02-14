import axios from "axios";
import { PostHog } from "posthog-node";

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: "https://eu.i.posthog.com",
});

export const trackEvent = (
  fid: number,
  event: string,
  properties: Record<string, unknown>
) => {
  if (process.env.NEXT_PUBLIC_POSTHOG_DISABLED === "true") {
    return;
  }
  console.log("tracking event", event, properties);
  posthog.capture({
    distinctId: fid.toString(),
    event,
    properties,
  });
};

export const sendBatchToPostHog = async (
  fid: number,
  event: string,
  properties: Record<string, unknown>[]
) => {
  const API_URL = "https://eu.i.posthog.com/batch/";
  const API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!API_KEY) {
    console.error("PostHog API key not found");
    return;
  }

  const completedEvents = properties.map((property, index) => ({
    event,
    properties: {
      ...property,
      distinct_id: fid.toString(),
      number_in_batch: index + 1,
    },
  }));

  const payload = {
    api_key: API_KEY,
    batch: completedEvents,
  };

  try {
    await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(
      "Error sending batch to PostHog:",
      JSON.stringify(error, null, 2)
    );
  }
};
