import { sdk } from "@farcaster/frame-sdk";
import { useFrameContext } from "@/context/FrameContext";
import { useCallback, useEffect, useState } from "react";
import { MESSAGE_EXPIRATION_TIME } from "@/lib/contracts/constants";
import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";
import { getUserNowDate } from "@/lib/utils";
import { useAuthCheck } from "./use-auth-check";

export const useSignIn = (isInMaintenance: boolean) => {
  const { isSDKLoaded, context, error: contextError } = useFrameContext();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>(
    localStorage.getItem("token") || ""
  );
  const { error: authCheckError } = useAuthCheck(isInMaintenance);

  const signIn = useCallback(async () => {
    try {
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
        context?.location?.type === "cast_embed"
          ? context?.location.cast.fid
          : null;

      const userNow = getUserNowDate().toISOString();

      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature: result?.signature,
          message: result?.message,
          fid: context?.user?.fid,
          referrerFid,
          userNow,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Sign in failed");
      }

      const data = await res.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign in failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [context, contextError]);

  const handleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (token && !isSignedIn && !authCheckError) {
        setIsSignedIn(true);
      } else {
        const data = await signIn();
        localStorage.setItem("token", data.token);
        setToken(data.token);
      }
      setIsSignedIn(true);
      posthog.identify(context?.user?.fid.toString());
      Sentry.setUser({
        id: context?.user?.fid.toString(),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign in failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authCheckError, context?.user?.fid, isSignedIn, signIn, token]);

  useEffect(() => {
    if (
      !isInMaintenance &&
      isSDKLoaded &&
      !isSignedIn &&
      !isLoading &&
      !error
    ) {
      handleSignIn().catch((err) => {
        console.error("Auto sign-in failed:", err);
      });
    }
  }, [
    isInMaintenance,
    isSDKLoaded,
    isSignedIn,
    isLoading,
    error,
    handleSignIn,
  ]);

  useEffect(() => {
    if (!isInMaintenance && authCheckError) {
      localStorage.removeItem("token");
      setToken("");
      setIsSignedIn(false);
    }
  }, [isInMaintenance, authCheckError]);

  return { signIn: handleSignIn, isSignedIn, isLoading, error };
};
