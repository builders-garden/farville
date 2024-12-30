import posthog from "posthog-js";

export const trackEvent = (event: string, data: Record<string, unknown>) => {
  return posthog.capture(event, data);
};
