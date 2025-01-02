"use client";

import dynamic from "next/dynamic";
import { AudioProvider } from "../context/AudioContext";
import { GameProvider } from "../context/GameContext";
import posthog from "posthog-js";
import type { Session } from "next-auth";
import { PostHogProvider } from "posthog-js/react";
import { SessionProvider } from "next-auth/react";

const WagmiProvider = dynamic(() => import("../components/WagmiProvider"), {
  ssr: false,
});

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
  });
}

export function Providers({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <PostHogProvider client={posthog}>
        <WagmiProvider>
          <AudioProvider>
            <GameProvider>{children}</GameProvider>
          </AudioProvider>
        </WagmiProvider>
      </PostHogProvider>
    </SessionProvider>
  );
}
