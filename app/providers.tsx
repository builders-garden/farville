"use client";

import dynamic from "next/dynamic";
import { AudioProvider } from "./../context/AudioContext";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { NextStepProvider, NextStep } from "nextstepjs";
import { steps } from "@/components/tutorial/steps";
import CustomTutorialCard from "@/components/tutorial/CustomTutorialCard";
import { env } from "@/lib/env";

const WagmiProvider = dynamic(() => import("./../components/WagmiProvider"), {
  ssr: false,
});

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    // api_host: env.NEXT_PUBLIC_POSTHOG_HOST!,
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
        <NextStepProvider>
          <NextStep
            steps={steps}
            cardComponent={CustomTutorialCard}
            shadowOpacity="0.4"
            noInViewScroll={true}
            scrollToTop={false}
          >
            <AudioProvider>{children}</AudioProvider>
          </NextStep>
        </NextStepProvider>
      </WagmiProvider>
    </PostHogProvider>
  );
}
