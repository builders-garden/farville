import posthog from "posthog-js";

export const trackEvent = (event: string, data: Record<string, unknown>) => {
  posthog.capture(event, data);
};
