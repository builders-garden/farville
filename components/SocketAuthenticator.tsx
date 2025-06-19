"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useGame } from "@/context/GameContext";

export const SocketAuthenticator = () => {
  const { connectWithAuth } = useSocket();
  const { state } = useGame();
  const lastFidRef = useRef<number | null>(null);

  useEffect(() => {
    // Only connect if we have a user FID and it's different from the last one we connected with
    if (state.user?.fid && state.user.fid !== lastFidRef.current) {
      console.log("Authenticating socket with FID:", state.user.fid);
      connectWithAuth(state.user.fid);
      lastFidRef.current = state.user.fid;
    }
  }, [state.user?.fid, connectWithAuth]);

  return null; // This component doesn't render anything
};
