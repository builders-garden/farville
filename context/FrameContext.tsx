"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { FrameContext, SafeAreaInsets } from "@farcaster/frame-node";
import { env } from "@/lib/env";

export const useFrameContext = () => {
  const [context, setContext] = useState<FrameContext | null>(null);
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const context = await sdk.context;
        if (context) {
          if (context.client?.safeAreaInsets) {
            setSafeAreaInsets(context.client.safeAreaInsets);
          }
          setContext(context as FrameContext);
        } else {
          setError("Failed to load Farcaster context");
        }
        await sdk.actions.ready({
          disableNativeGestures: true,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize SDK"
        );
        console.error("SDK initialization error:", err);
      }
    };

    if (sdk && !isSDKLoaded) {
      load().then(() => {
        setIsSDKLoaded(true);
        if (
          !context?.client.added &&
          !env.NEXT_PUBLIC_URL.includes("localhost")
        ) {
          try {
            sdk.actions.addFrame();
          } catch (err) {
            console.error("Failed to add frame:", err);
          }
        }
      });
    }
  }, [isSDKLoaded]);

  return {
    context,
    safeAreaInsets,
    isSDKLoaded,
    error,
  };
};
