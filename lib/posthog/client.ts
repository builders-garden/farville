import posthog from "posthog-js";

export const trackEvent = (
  event: string,
  data: Record<string, unknown>,
  fid?: number
) => {
  if (fid && posthog.get_distinct_id() !== fid.toString()) {
    posthog.identify(fid.toString());
  }
  return posthog.capture(event, data);
};
