import { useFrameContext } from "@/context/FrameContext";
import { useTestMode } from "@/context/TestContext";
import { UserType } from "@/lib/types/game";
import { sdk } from "@farcaster/frame-sdk";
import posthog from "posthog-js";
import { useCallback, useEffect, useState } from "react";
import { useAuthCheck } from "./use-auth-check";

export const useSignIn = (isInMaintenance: boolean) => {
  const { isSDKLoaded, context, error: contextError } = useFrameContext();
  const { isTestMode } = useTestMode();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isBot, setIsBot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    error: authCheckError,
    data: authCheckResult,
    isLoading: isLoadingAuthCheck,
  } = useAuthCheck(isInMaintenance, context?.user?.fid?.toString());

  const signIn = useCallback(async () => {
    try {
      if (contextError) {
        console.error("signIn contextError", contextError);
        throw new Error(`SDK initialization failed: ${contextError}`);
      }

      let token;
      if (isTestMode) {
        token = "<3 from test mode";
      } else {
        if (!context) throw new Error("Farville must be played from Warpcast!");
        if (!context.user?.fid)
          throw new Error(
            "No FID found. Please make sure you're logged into Warpcast."
          );
        const { token: farcasterToken } = await sdk.quickAuth.getToken();
        if (!farcasterToken) throw new Error("Sign in failed");
        token = farcasterToken;
      }

      const referrerFid =
        context?.location?.type === "cast_embed"
          ? context?.location.cast.author.fid
          : null;

      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          referrerFid,
        }),
      });

      if (!res.ok) {
        console.error("signIn res error");
        const errorData = await res.json().catch(() => ({}));
        console.error(
          "signIn res error data",
          JSON.stringify(errorData, null, 2)
        );
        throw new Error(errorData.message || "Sign in failed");
      }

      const data = await res.json();
      console.log("signIn data", data);

      if (!data.success) {
        console.error("signIn data error", data);
        throw new Error(data.error || "Sign in failed");
      }

      if (data.user.bot === UserType.Bot) {
        setIsBot(true);
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign in failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [context, contextError, isTestMode]);

  const handleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!isSignedIn && !authCheckError && authCheckResult?.message === "ok") {
        setIsSignedIn(true);
        // check if the user is a bot
        if (authCheckResult?.data?.isBot) {
          setIsBot(true);
        }
      } else if (!isSignedIn || authCheckError) {
        console.log("handleSignIn signIn", authCheckError, !isSignedIn);
        const data = await signIn();
        if (!data.success) throw new Error(data.error ?? "Sign in failed");
        if (!data.token) throw new Error("Sign in failed");
        setIsSignedIn(true);
      }
      posthog.identify(context?.user?.fid.toString());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign in failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authCheckError, authCheckResult, context?.user?.fid, isSignedIn, signIn]);

  useEffect(() => {
    if (
      !isInMaintenance &&
      isSDKLoaded &&
      !isSignedIn &&
      !isLoading &&
      !isLoadingAuthCheck &&
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
    isLoadingAuthCheck,
  ]);

  useEffect(() => {
    if (!isInMaintenance && authCheckError) {
      console.log("useEffect authCheckError", authCheckError);
      setIsSignedIn(false);
    }
  }, [isInMaintenance, authCheckError]);

  return { signIn: handleSignIn, isSignedIn, isLoading, error, isBot };
};
