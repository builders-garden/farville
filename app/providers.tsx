"use client";

import dynamic from "next/dynamic";
import { AudioProvider } from "./../context/AudioContext";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

const WagmiProvider = dynamic(() => import("./../components/WagmiProvider"), {
  ssr: false,
});

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    // api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    capture_pageview: false,
    capture_pageleave: false,
    autocapture: false,
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <WagmiProvider>
        <AudioProvider>{children}</AudioProvider>
      </WagmiProvider>
    </PostHogProvider>
  );
}
