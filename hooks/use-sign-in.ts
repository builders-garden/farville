import { sdk } from "@farcaster/frame-sdk";
import { useFrameContext } from "@/context/FrameContext";
import { useCallback, useEffect, useState } from "react";
import { MESSAGE_EXPIRATION_TIME } from "@/lib/constants";
import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";
import { getMidnightForUserTimezone } from "@/lib/utils";

export const useSignIn = () => {
  const { isSDKLoaded, context, error: contextError } = useFrameContext();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (contextError) {
        throw new Error(`SDK initialization failed: ${contextError}`);
      }

      if (!context) {
        throw new Error("FarVille must be played from Warpcast!");
      }

      if (!context.user?.fid) {
        throw new Error(
          "No FID found. Please make sure you're logged into Warpcast."
        );
      }

      const result = await sdk.actions.signIn({
        nonce: Math.random().toString(36).substring(2),
        notBefore: new Date().toISOString(),
        expirationTime: new Date(
          Date.now() + MESSAGE_EXPIRATION_TIME
        ).toISOString(),
      });

      const referrerFid =
        context.location?.type === "cast_embed"
          ? context.location.cast.fid
          : null;

      const midnightForUser = getMidnightForUserTimezone();

      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature: result.signature,
          message: result.message,
          fid: context.user.fid,
          referrerFid,
          midnightForUser
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Sign in failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      setIsSignedIn(true);
      posthog.identify(context.user.fid.toString());
      Sentry.setUser({
        id: context.user.fid.toString(),
      });
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign in failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [context, contextError, isSDKLoaded]);

  useEffect(() => {
    if (isSDKLoaded && !isSignedIn && !isLoading && !error) {
      signIn().catch((err) => {
        console.error("Auto sign-in failed:", err);
      });
    }
  }, [isSDKLoaded, isSignedIn, isLoading, error, signIn]);

  return { signIn, isSignedIn, isLoading, error };
};
