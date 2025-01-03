"use client";
import sdk, { FrameContext, SafeAreaInsets } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";

export const useFrameContext = () => {
  const [context, setContext] = useState<FrameContext | null>(null);
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      await sdk.actions.ready();
      const context = await sdk.context;
      if (context) {
        if (context.client?.safeAreaInsets) {
          setSafeAreaInsets(context.client.safeAreaInsets);
        }
        setContext(context);
      }
    };
    if (sdk && !isSDKLoaded) {
      load().then(() => {
        console.log("SDK loaded");
        setIsSDKLoaded(true);
      });
    }
  }, [isSDKLoaded]);

  return {
    context,
    safeAreaInsets,
    isSDKLoaded,
  };
};
