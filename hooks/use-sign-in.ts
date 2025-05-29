import { sdk } from "@farcaster/frame-sdk";
import { useFrameContext } from "@/context/FrameContext";
import { useTestMode } from "@/context/TestContext";
import { useCallback, useEffect, useState } from "react";
import { MESSAGE_EXPIRATION_TIME } from "@/lib/contracts/constants";
import posthog from "posthog-js";
import { useAuthCheck } from "./use-auth-check";

export const useSignIn = (isInMaintenance: boolean) => {
  const { isSDKLoaded, context, error: contextError } = useFrameContext();
  const { isTestMode } = useTestMode();
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
        console.error("signIn contextError", contextError);
        throw new Error(`SDK initialization failed: ${contextError}`);
      }

      let result;
      const nonce = Math.random().toString(36).substring(2);
      if (isTestMode) {
        result = {
          signature: "0x123",
          message: "<3 from test mode",
          fid: null,
          referrerFid: null,
        };
      } else {
        if (!context) throw new Error("Farville must be played from Warpcast!");
        if (!context.user?.fid)
          throw new Error(
            "No FID found. Please make sure you're logged into Warpcast."
          );

        result = await sdk.actions.signIn({
          nonce,
          notBefore: new Date().toISOString(),
          expirationTime: new Date(
            Date.now() + MESSAGE_EXPIRATION_TIME
          ).toISOString(),
          acceptAuthAddress: true,
        });
        console.log("farcaster signIn result", result);
      }

      const referrerFid =
        context?.location?.type === "cast_embed"
          ? context?.location.cast.fid
          : null;

      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nonce,
          signature: result?.signature,
          message: result?.message,
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
      console.log("handleSignIn", token, isSignedIn, authCheckError);
      if (token && !isSignedIn && !authCheckError) {
        setIsSignedIn(true);
      } else {
        const data = await signIn();
        console.log(
          "handleSignIn sign-in response",
          JSON.stringify(data, null, 2)
        );
        localStorage.setItem("token", data.token);
        setToken(data.token);
      }
      setIsSignedIn(true);
      posthog.identify(context?.user?.fid.toString());
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
      console.log("useEffect handleSignIn auto sign-in");
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
      console.log("useEffect authCheckError", authCheckError);
      localStorage.removeItem("token");
      setToken("");
      setIsSignedIn(false);
    }
  }, [isInMaintenance, authCheckError]);

  return { signIn: handleSignIn, isSignedIn, isLoading, error };
};
