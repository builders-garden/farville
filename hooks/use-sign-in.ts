import { sdk } from "@farcaster/frame-sdk";
import { useFrameContext } from "@/context/FrameContext";
import { useCallback, useEffect, useState } from "react";
import { MESSAGE_EXPIRATION_TIME } from "@/lib/constants";
import posthog from "posthog-js";

export const useSignIn = () => {
  const { isSDKLoaded, context } = useFrameContext();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!context) {
        throw new Error("You must use play FarVille from Warpcast!");
      }

      const result = await sdk.actions.signIn({
        nonce: Math.random().toString(36).substring(2),
        notBefore: new Date().toISOString(),
        expirationTime: new Date(
          Date.now() + MESSAGE_EXPIRATION_TIME
        ).toISOString(),
      });

      let referrerFid = null;
      if (context && context.location?.type === "cast_embed") {
        referrerFid = context.location.cast.fid;
      }

      const res = await fetch("/api/sign-in", {
        method: "POST",
        body: JSON.stringify({
          signature: result.signature,
          message: result.message,
          fid: context?.user.fid,
          referrerFid: referrerFid,
        }),
      });

      if (!res.ok) {
        throw new Error("Sign in failed");
      }

      const data = await res.json();
      setIsSignedIn(true);
      posthog.identify(context?.user.fid.toString());
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [context, isSDKLoaded]);

  useEffect(() => {
    if (isSDKLoaded) {
      signIn();
    }
  }, [isSDKLoaded, signIn]);

  return { signIn, isSignedIn, isLoading, error };
};
