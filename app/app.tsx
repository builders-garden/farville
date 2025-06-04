"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import type { OverlayConfig } from "@/context/GameContext";
import { useAccount, useConnect } from "wagmi";
import farcasterFrame from "@farcaster/frame-wagmi-connector";
import { useFrameContext } from "@/context/FrameContext";

const Game = dynamic(() => import("./../components/Game"), {
  ssr: false,
});

const GameWrapper = dynamic(() => import("./../components/GameWrapper"), {
  ssr: false,
});

export default function App({
  initialOverlay,
}: {
  initialOverlay?: OverlayConfig;
}) {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { context } = useFrameContext();

  // always connect to wagmi farcaster frame to retrieve wallet address
  useEffect(() => {
    if (!isConnected || !address) {
      if (context) {
        connect({ connector: farcasterFrame() });
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  return (
    <>
      <Game initialOverlay={initialOverlay}>
        <GameWrapper />
      </Game>
    </>
  );
}
