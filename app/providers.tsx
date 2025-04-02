"use client";

import dynamic from "next/dynamic";
import { AudioProvider } from "./../context/AudioContext";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { NextStepProvider, NextStep } from "nextstepjs";

const WagmiProvider = dynamic(() => import("./../components/WagmiProvider"), {
  ssr: false,
});

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    // api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    autocapture: false,
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
  });
}

const steps = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👩‍🌾",
        title: "Welcome Farmer",
        content: "Let's get started with your Farville journey!",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "🌱",
        title: "Choose a Seed",
        content: "Select carrots seeds from the inventory to plant them.",
        selector: "#carrot-seeds",
        // side: "right",
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🌱",
        title: "Plant",
        content: "Now plant the carrot seeds in the field.",
        selector: "#carrot-seeds",
        // side: "right",
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🌱",
        title: "Fertilize",
        content: "Don't waste time, fertilize your seeds to grow faster.",
        selector: "#carrot-seeds",
        // side: "right",
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      // More steps...
    ],
  },
];

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <WagmiProvider>
        <NextStepProvider>
          <NextStep steps={steps}>
            <AudioProvider>{children}</AudioProvider>
          </NextStep>
        </NextStepProvider>
      </WagmiProvider>
    </PostHogProvider>
  );
}
